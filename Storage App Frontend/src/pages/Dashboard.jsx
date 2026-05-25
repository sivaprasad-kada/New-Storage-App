import React, { useState, useEffect } from 'react';
import { Upload, Lock, Trash2 } from 'lucide-react';
import { usePlanAccess } from '../hooks/usePlanAccess';
import RecentActivity from '../components/RecentActivity';
import FileDetailsPanel from '../components/FileDetailsPanel';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';
import ShareModal from '../components/ShareModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { dirId } = useParams();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [directoryName, setDirectoryName] = useState("My Drive");
    const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'My Drive' }]);
    const [directoriesList, setDirectoriesList] = useState([]);
    const [filesList, setFilesList] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    // Modal state
    const [showCreateDirModal, setShowCreateDirModal] = useState(false);
    const [newDirname, setNewDirname] = useState("New Folder");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Alert Modal State
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isDanger: false });

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [itemToShare, setItemToShare] = useState(null);

    // Delete State
    const [isDeleting, setIsDeleting] = useState(false);

    // Bulk Selection State
    const [selectedFileIds, setSelectedFileIds] = useState([]);
    const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Plan Access
    const { hasAccess: canImportDrive } = usePlanAccess('googleDriveImport');

    // File Input
    const fileInputRef = React.useRef(null);

    // Fetch Items
    async function getDirectoryItems() {
        setErrorMessage("");

        const url = dirId ? `${BASE_URL}/directory/${dirId}` : `${BASE_URL}/directory/`;

        try {
            const response = await fetch(url, {
                credentials: "include",
            });
            if (response.status === 401) {
                // Navigate to auth if unauthorized
                navigate("/auth");
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch directory");

            const data = await response.json();
            // Assuming data.directories and data.files exist
            setDirectoriesList([...(data.directories || [])].reverse());
            setFilesList([...(data.files || [])].reverse());

            // Set directory name if available (and not root)
            if (data.name && dirId) {
                setDirectoryName(data.name);
            } else if (!dirId) {
                setDirectoryName("My Drive");
            }

            // Set breadcrumbs
            if (data.breadcrumbs) {
                setBreadcrumbs([{ id: null, name: 'My Drive' }, ...data.breadcrumbs]);
            } else {
                setBreadcrumbs([{ id: null, name: 'My Drive' }]);
            }

        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    useEffect(() => {
        getDirectoryItems();
        // Clear selection when navigating
        setSelectedFile(null);
        setSelectedFileIds([]);
    }, [dirId]);

    // Helper for file icons (tags for RecentActivity)
    const getFileTags = (filename) => {
        if (!filename) return ['file'];
        const ext = filename.split('.').pop().toLowerCase();
        if (['jpg', 'png', 'jpeg', 'gif', 'svg'].includes(ext)) return ['image'];
        if (['pdf', 'doc', 'docx', 'txt'].includes(ext)) return ['document'];
        if (['mp4', 'mov', 'avi'].includes(ext)) return ['video'];
        if (['js', 'jsx', 'ts', 'tsx', 'py', 'html', 'css'].includes(ext)) return ['code'];
        if (['zip', 'rar', '7z'].includes(ext)) return ['archive'];
        return ['file'];
    };

    // Format for RecentActivity
    const combinedItems = [
        ...directoriesList.map(d => ({
            ...d,
            name: d.name,
            tags: ['folder'],
            size: '-',
            modified: new Date(d.createdAt || Date.now()).toLocaleDateString(),
            isDirectory: true
        })),
        ...filesList.map(f => ({
            ...f,
            name: f.filename || f.name, // Support both potential API keys
            tags: getFileTags(f.filename || f.name),
            size: f.size ? (f.size / 1024).toFixed(1) + ' KB' : (f.length ? (f.length / 1024).toFixed(1) + ' KB' : '0 KB'),
            modified: new Date(f.uploadDate || Date.now()).toLocaleDateString(),
            isDirectory: false
        }))
    ];

    // Upload Logic
    function handleFileSelect(e) {
        if (!e.target.files || e.target.files.length === 0) return;

        // Convert FileList to array
        const files = Array.from(e.target.files);

        // Start uploading
        setIsUploading(true);

        // Process each file
        files.forEach(file => {
            uploadFile(file);
        });

        e.target.value = ""; // Reset input
    }

    async function uploadFile(file) {
        // Create temp ID
        const tempId = `temp-${Date.now()}-${Math.random()}`;

        // Initial Progress
        setUploadQueue(prev => [...prev, {
            id: tempId,
            file,
            fileName: file.name,
            progress: 0,
            status: 'uploading',
            xhr: null
        }]);

        try {
            // 1. Initiate Upload
            const initUrl = `${BASE_URL}/file/upload/initiate`;
            const initRes = await fetch(initUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: file.name,
                    size: file.size,
                    contentType: file.type || "application/octet-stream",
                    parentDirId: dirId || undefined
                }),
                credentials: "include"
            });

            if (!initRes.ok) {
                const errData = await initRes.json();

                if (initRes.status === 413) {
                    throw new Error(`File "${file.name}" is too large.`);
                }
                if (initRes.status === 403) {
                    throw new Error(`Not enough storage space to upload "${file.name}".`);
                }
                if (initRes.status === 409) {
                    // Duplicate — mark as failed with a friendly label
                    throw new Error(`duplicate:${errData.message || `"${file.name}" already exists in this folder.`}`);
                }

                throw new Error(errData.error || "Upload initiation failed");
            }

            const { uploadSignedUrl, fileId } = await initRes.json();

            // 2. Upload to S3
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                
                // Store xhr for cancellation
                setUploadQueue(prev => prev.map(u => u.id === tempId ? { ...u, xhr } : u));

                xhr.open("PUT", uploadSignedUrl, true);
                xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

                xhr.upload.addEventListener("progress", (evt) => {
                    if (evt.lengthComputable) {
                        const percent = (evt.loaded / evt.total) * 100;
                        setUploadQueue(prev => prev.map(u => u.id === tempId ? { ...u, progress: percent } : u));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error("S3 Upload failed"));
                    }
                };

                xhr.onabort = () => reject(new Error("Upload cancelled"));
                xhr.onerror = () => reject(new Error("Network error during S3 upload"));

                xhr.send(file);
            });

            // 3. Complete Upload
            const completeUrl = `${BASE_URL}/file/upload/complete`;
            const completeRes = await fetch(completeUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fileId,
                }),
                credentials: "include"
            });

            if (!completeRes.ok) throw new Error("Upload completion failed");

            // Mark completed
            setUploadQueue(prev => prev.map(u => u.id === tempId ? { ...u, status: 'completed', progress: 100 } : u));

            // Refresh list after brief delay
            setTimeout(() => {
                getDirectoryItems();
            }, 1000);

        } catch (error) {
            console.error("Upload failed:", error);

            const isDuplicate = error.message?.startsWith('duplicate:');
            const displayMsg = isDuplicate
                ? error.message.replace('duplicate:', '')
                : error.message || `Could not upload "${file.name}".`;

            if (error.message !== 'Upload cancelled') {
                setAlertConfig({
                    title: isDuplicate ? 'Duplicate File' : 'Upload Failed',
                    message: displayMsg,
                    isDanger: !isDuplicate
                });
                setShowAlertModal(true);
            }

            setUploadQueue(prev => prev.map(u =>
                u.id === tempId
                    ? { ...u, status: 'failed', error: displayMsg, isDuplicate }
                    : u
            ));
        }
    }

    const cancelUpload = (id) => {
        setUploadQueue(prev => {
            const upload = prev.find(u => u.id === id);
            if (upload && upload.xhr) {
                upload.xhr.abort();
            }
            return prev.filter(u => u.id !== id); // Remove from queue
        });
    };

    const retryUpload = (id) => {
        setUploadQueue(prev => {
            const upload = prev.find(u => u.id === id);
            if (upload && upload.file) {
                // Call uploadFile again with the same file
                setTimeout(() => uploadFile(upload.file), 0);
            }
            return prev.filter(u => u.id !== id);
        });
    }

    // Create Folder
    async function handleCreateDirectory() {
        if (!newDirname) return;
        const url = dirId ? `${BASE_URL}/directory/${dirId}` : `${BASE_URL}/directory/`;
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { dirname: newDirname },
                credentials: "include",
            });
            if (response.ok) {
                setNewDirname("New Folder");
                setShowCreateDirModal(false);
                getDirectoryItems();
            } else {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to create directory");
            }
        } catch (err) {
            console.error(err);
            setAlertConfig({
                title: "Folder Creation Failed",
                message: err.message || "Failed to create folder. Please try again.",
                isDanger: true
            });
            setShowAlertModal(true);
        }
    }

    // Auto-hide upload UI when complete
    useEffect(() => {
        if (isUploading) {
            const allDone = uploadQueue.length > 0 && uploadQueue.every(u => u.status === 'completed' || u.status === 'failed');
            if (allDone) {
                const t = setTimeout(() => {
                    setIsUploading(false);
                    setUploadQueue(prev => prev.filter(u => u.status !== 'completed'));
                }, 3000);
                return () => clearTimeout(t);
            }
            if (uploadQueue.length === 0) {
                setIsUploading(false);
            }
        }
    }, [uploadQueue, isUploading]);

    // Navigation & Actions
    function handleRowClick(id) {
        // Navigate to the directory view
        navigate(`/directory/${id}`);
    }

    function handleFileClick(name, id) {
        // Open file in new tab (view)
        window.open(`${BASE_URL}/file/${id}`, '_blank');
    }

    function handleDownload(file) {
        // Trigger download
        const downloadUrl = `${BASE_URL}/file/${file.id || file._id}?action=download`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name || file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function handleDelete(file) {
        setItemToDelete(file);
        setShowDeleteModal(true);
    }

    async function executeDelete() {
        if (!itemToDelete || isDeleting) return;
        setIsDeleting(true);

        // Optimistic UI Update
        const previousFiles = [...filesList];
        const previousDirs = [...directoriesList];
        const isDir = itemToDelete.isDirectory || (itemToDelete.tags && itemToDelete.tags.includes('folder'));
        const id = itemToDelete.id || itemToDelete._id;

        // Remove immediately from UI
        if (isDir) {
            setDirectoriesList(prev => prev.filter(d => (d.id || d._id) !== id));
        } else {
            setFilesList(prev => prev.filter(f => (f.id || f._id) !== id));
        }

        // Close modal immediately
        setShowDeleteModal(false);

        try {
            const endpoint = isDir ? 'directory' : 'file';
            const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
                method: "DELETE",
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to delete item");
            }

            // Close panel if deleted item is selected
            if (selectedFile && (selectedFile.id === id || selectedFile._id === id)) {
                setSelectedFile(null);
            }

            // Optional: Silently sync to ensure truth
            // getDirectoryItems();
        } catch (error) {
            console.error(error);
            // Revert on failure
            setDirectoriesList(previousDirs);
            setFilesList(previousFiles);
            setErrorMessage(error.message);

            setAlertConfig({
                title: "Deletion Failed",
                message: error.message,
                isDanger: true
            });
            setShowAlertModal(true);
        } finally {
            setItemToDelete(null);
            setIsDeleting(false);
        }
    }

    // Bulk selection helpers
    const toggleFileSelection = (fileId) => {
        setSelectedFileIds(prev =>
            prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
        );
    };

    const selectAllFiles = () => {
        const allFileIds = filesList.map(f => f._id || f.id).filter(Boolean);
        setSelectedFileIds(allFileIds);
    };

    const deselectAllFiles = () => setSelectedFileIds([]);

    const executeBulkDelete = async () => {
        if (selectedFileIds.length === 0 || isBulkDeleting) return;
        setIsBulkDeleting(true);

        // Optimistic UI
        const previousFiles = [...filesList];
        setFilesList(prev => prev.filter(f => !selectedFileIds.includes(f._id || f.id)));
        setShowBulkDeleteModal(false);

        try {
            const response = await fetch(`${BASE_URL}/file/bulk-delete`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ fileIds: selectedFileIds }),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || 'Bulk delete failed');
            }

            const data = await response.json();
            setSelectedFileIds([]);
            setAlertConfig({
                title: 'Deleted Successfully',
                message: `${data.deletedCount} file${data.deletedCount !== 1 ? 's' : ''} deleted.`,
                isDanger: false,
            });
            setShowAlertModal(true);
        } catch (error) {
            console.error(error);
            // Revert
            setFilesList(previousFiles);
            setAlertConfig({ title: 'Bulk Delete Failed', message: error.message, isDanger: true });
            setShowAlertModal(true);
        } finally {
            setIsBulkDeleting(false);
        }
    };

    function handleShareClick(file) {
        if (file.isDirectory) {
            setAlertConfig({ title: 'Cannot share folder', message: 'Folder sharing is coming soon.', isDanger: false });
            setShowAlertModal(true);
            return;
        }
        setItemToShare(file);
        setShowShareModal(true);
    }

    async function executeShare(shareOptions) {
        if (!itemToShare) return;
        const id = itemToShare.id || itemToShare._id;
        const response = await fetch(`${BASE_URL}/api/files/${id}/share`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(shareOptions),
            credentials: "include",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to create share link");
        }
        return await response.json();
    }

    return (
        <div className="flex relative h-full gap-0 lg:gap-4 transition-all duration-300 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 space-y-8 dark:text-gray-100 relative h-full overflow-y-auto overflow-x-hidden pr-2 pb-20">
                {/* Hidden Inputs */}
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {/* Breadcrumbs */}
                <div className="mb-2 sm:mb-4 flex items-center gap-2 text-sm font-medium text-gray-500 overflow-x-auto whitespace-nowrap pb-2 hide-scrollbar">
                    {breadcrumbs.map((crumb, index) => (
                        <React.Fragment key={crumb.id || 'root'}>
                            <button 
                                onClick={() => crumb.id ? navigate(`/directory/${crumb.id}`) : navigate('/')}
                                className={`hover:text-brand-primary transition-colors ${index === breadcrumbs.length - 1 ? 'text-black dark:text-white font-bold pointer-events-none' : ''}`}
                            >
                                {crumb.id ? crumb.name : 'My Drive'}
                            </button>
                            {index < breadcrumbs.length - 1 && <span className="opacity-50">/</span>}
                        </React.Fragment>
                    ))}
                </div>

                {/* Welcome Banner */}
                <div className="mb-3 sm:mb-6">
                    <h1 className="text-2xl sm:text-4xl font-bold text-black dark:text-white mb-1 hidden sm:block">
                        {dirId ? directoryName : "Welcome to Cloud Drive"}
                    </h1>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        {!dirId && <h2 className="text-xl sm:text-4xl font-bold text-black dark:text-gray-200"><span className="hidden sm:inline">An </span><span className="text-brand-primary">Ai</span> powered Cloud Drive</h2>}
                        {dirId && <p className="text-gray-500 font-medium">Inside {directoryName}</p>}
                    </div>
                </div>

                {/* Upload Area */}
                <div className="bg-gray-200 dark:bg-slate-800 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-2xl sm:rounded-3xl p-4 sm:p-8 flex flex-col items-center justify-center text-center relative mb-6 sm:mb-8 transition-colors min-h-[180px] sm:min-h-[250px]">
                    <div className="text-brand-primary mb-4">
                        <Upload size={48} className="mx-auto" />
                    </div>

                    {uploadQueue.length > 0 ? (
                        <div className="w-full max-w-2xl space-y-3 mt-4 text-left max-h-[300px] overflow-y-auto pr-2">
                            {uploadQueue.map(upload => (
                                <div key={upload.id} className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-600">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-primary shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                            <span className="text-sm font-bold truncate text-black dark:text-white">{upload.fileName}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {upload.status === 'uploading' && (
                                                <button onClick={() => cancelUpload(upload.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded transition-colors" title="Cancel Upload">
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                                </button>
                                            )}
                                            {upload.status === 'failed' && (
                                                <button onClick={() => retryUpload(upload.id)} className="text-brand-primary hover:bg-brand-primary/10 p-1.5 rounded text-xs font-bold transition-colors">
                                                    Retry
                                                </button>
                                            )}
                                            {upload.status === 'completed' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-300 ${upload.status === 'failed' ? 'bg-red-500' : upload.status === 'completed' ? 'bg-green-500' : 'bg-brand-primary'}`} 
                                                style={{ width: `${upload.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 w-8 text-right">
                                            {upload.status === 'failed' ? 'Error' : `${Math.round(upload.progress)}%`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <h3 className="text-base sm:text-xl font-bold text-black dark:text-white mb-1">
                                {dirId ? `Upload to ${directoryName}` : "Upload Files or Create Directory"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-bold mb-4 sm:mb-8 text-sm hidden sm:block">Drag and drop files here, or click to select files</p>

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full justify-center max-w-2xl">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 transition-all active:scale-95">
                                    <Upload size={20} /> Upload Files
                                </button>
                                <button
                                    onClick={() => setShowCreateDirModal(true)}
                                    className="flex-1 bg-gray-800 hover:bg-gray-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-gray-800/20 dark:shadow-slate-700/20 transition-all active:scale-95">
                                    Create Folder
                                </button>
                                {!dirId && (
                                    <div className="flex-1 relative group flex">
                                        <button 
                                            className={`w-full bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-black dark:text-white py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm border border-gray-200 dark:border-slate-600 transition-all ${!canImportDrive ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
                                            disabled={!canImportDrive}
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                            Import Drive
                                            {!canImportDrive && <Lock size={14} className="ml-1 text-gray-400" />}
                                        </button>
                                        {!canImportDrive && (
                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-10">
                                                Upgrade to Premium to import from Google Drive
                                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Create Directory Modal Overlay */}
                {showCreateDirModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold mb-4 text-black dark:text-white">New Folder</h3>
                            <input
                                autoFocus
                                type="text"
                                value={newDirname}
                                onChange={(e) => setNewDirname(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateDirectory()}
                                className="w-full bg-gray-100 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 focus:border-brand-primary rounded-xl px-4 py-3 mb-6 outline-none font-medium dark:text-white"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCreateDirModal(false)}
                                    className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateDirectory}
                                    disabled={!newDirname.trim()}
                                    className="flex-1 py-3 font-bold bg-brand-primary text-white rounded-xl shadow-lg hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Action Toolbar */}
                {selectedFileIds.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-brand-primary/10 border border-brand-primary/30 rounded-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        <span className="font-bold text-brand-primary text-xs sm:text-sm">
                            {selectedFileIds.length} file{selectedFileIds.length !== 1 ? 's' : ''} selected
                        </span>
                        <div className="flex gap-1.5 sm:gap-2 ml-auto flex-wrap">
                            <button
                                onClick={selectAllFiles}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 transition-colors"
                            >
                                All
                            </button>
                            <button
                                onClick={deselectAllFiles}
                                className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={() => setShowBulkDeleteModal(true)}
                                disabled={isBulkDeleting}
                                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Trash2 size={12} />
                                Delete
                            </button>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <RecentActivity
                    files={combinedItems}
                    onNavigate={handleRowClick}
                    onFileClick={handleFileClick}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onDetailsClick={setSelectedFile}
                    onShare={handleShareClick}
                    selectedFileIds={selectedFileIds}
                    onToggleSelect={toggleFileSelection}
                />
            </div>

            {/* Side Panel (Responsive) */}
            <div className={`transition-all duration-300 ease-in-out shrink-0 ${selectedFile ? 'lg:w-[350px] w-0 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
                {/* Always render FileDetailsPanel but let it handle `inline` */}
                <div className="h-full lg:w-[350px] w-0">
                    <FileDetailsPanel
                        file={selectedFile}
                        isOpen={!!selectedFile}
                        onClose={() => setSelectedFile(null)}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onShare={handleShareClick}
                        inline={true}
                    />
                </div>
            </div>


            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={executeDelete}
                title="Delete Item?"
                message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                isDanger={true}
                isLoading={isDeleting}
            />

            <ConfirmationModal
                isOpen={showBulkDeleteModal}
                onClose={() => setShowBulkDeleteModal(false)}
                onConfirm={executeBulkDelete}
                title={`Delete ${selectedFileIds.length} File${selectedFileIds.length !== 1 ? 's' : ''}?`}
                message={`Are you sure you want to permanently delete ${selectedFileIds.length} selected file${selectedFileIds.length !== 1 ? 's' : ''}? This cannot be undone.`}
                confirmText="Delete All"
                isDanger={true}
                isLoading={isBulkDeleting}
            />

            <ShareModal 
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                file={itemToShare}
                onShare={executeShare}
            />

            <AlertModal
                isOpen={showAlertModal}
                onClose={() => setShowAlertModal(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                isDanger={alertConfig.isDanger}
            />
        </div >
    );
};
export default Dashboard;
