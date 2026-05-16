import React, { useState, useEffect } from 'react';
import { Upload, Plus } from 'lucide-react';
import RecentActivity from '../components/RecentActivity';
import FileDetailsPanel from '../components/FileDetailsPanel';
import { useNavigate } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';
import ShareModal from '../components/ShareModal';

const MyFiles = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const [directoriesList, setDirectoriesList] = useState([]);
    const [filesList, setFilesList] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [progressMap, setProgressMap] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    // Modal state
    const [showCreateDirModal, setShowCreateDirModal] = useState(false);
    const [newDirname, setNewDirname] = useState("New Folder");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Share Modal State
    const [showShareModal, setShowShareModal] = useState(false);
    const [itemToShare, setItemToShare] = useState(null);

    // Alert Modal State
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isDanger: false });

    // File Input
    const fileInputRef = React.useRef(null);

    // Fetch Items - Always fetches root for MyFiles initially
    async function getDirectoryItems() {
        setErrorMessage("");

        // MyFiles is root view
        const url = `${BASE_URL}/directory/`;

        try {
            const response = await fetch(url, {
                credentials: "include",
            });
            if (response.status === 401) {
                navigate("/auth");
                return;
            }
            if (!response.ok) throw new Error("Failed to fetch directory");

            const data = await response.json();
            setDirectoriesList([...(data.directories || [])].reverse());
            setFilesList([...(data.files || [])].reverse());

        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    useEffect(() => {
        getDirectoryItems();
        setSelectedFile(null);
    }, []);

    // Helper for file icons
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
            name: f.filename || f.name,
            tags: getFileTags(f.filename || f.name),
            size: f.size ? (f.size / 1024).toFixed(1) + ' KB' : (f.length ? (f.length / 1024).toFixed(1) + ' KB' : '0 KB'),
            modified: new Date(f.uploadDate || Date.now()).toLocaleDateString(),
            isDirectory: false
        }))
    ];

    // Upload Logic
    function handleFileSelect(e) {
        if (!e.target.files || e.target.files.length === 0) return;
        const files = Array.from(e.target.files);
        setIsUploading(true);
        files.forEach(file => {
            uploadFile(file);
        });
        e.target.value = "";
    }

    async function uploadFile(file) {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        setProgressMap(prev => ({ ...prev, [tempId]: 0 }));

        try {
            // 1. Initiate Upload (Root)
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
                    parentDirId: undefined // Let backend default to root
                }),
                credentials: "include"
            });

            if (!initRes.ok) {
                const errData = await initRes.json();

                // Handle specific errors clearly
                if (initRes.status === 413) {
                    throw new Error(`File "${file.name}" is too large. Limit is 50MB.`);
                }
                if (initRes.status === 403) {
                    throw new Error(`Not enough storage space to upload "${file.name}".`);
                }

                throw new Error(errData.error || "Upload initiation failed");
            }

            const { uploadSignedUrl, fileId } = await initRes.json();

            // 2. Upload to S3
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", uploadSignedUrl, true);
                xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

                xhr.upload.addEventListener("progress", (evt) => {
                    if (evt.lengthComputable) {
                        const percent = (evt.loaded / evt.total) * 100;
                        setProgressMap(prev => ({ ...prev, [tempId]: percent }));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error("S3 Upload failed"));
                    }
                };

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

            // Refresh list after brief delay
            setTimeout(() => {
                getDirectoryItems();
            }, 1000);

        } catch (error) {
            console.error("Upload failed:", error);

            // Show Alert Modal
            setAlertConfig({
                title: "Upload Failed",
                message: error.message || `Could not upload "${file.name}".`,
                isDanger: true
            });
            setShowAlertModal(true);

            // Remove from progress map
            setProgressMap(prev => {
                const newMap = { ...prev };
                delete newMap[tempId];
                return newMap;
            });
        }
    }

    // Create Folder
    async function handleCreateDirectory() {
        if (!newDirname) return;
        const url = `${BASE_URL}/directory/`;
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
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Progress UI
    const activeUploads = Object.values(progressMap);
    const avgProgress = activeUploads.length ? activeUploads.reduce((a, b) => a + b, 0) / activeUploads.length : 0;

    useEffect(() => {
        const activeCount = Object.keys(progressMap).length;
        if (isUploading) {
            if (activeCount === 0 || avgProgress === 100) {
                const t = setTimeout(() => {
                    setIsUploading(false);
                    setProgressMap({});
                }, 2000);
                return () => clearTimeout(t);
            }
        }
    }, [avgProgress, isUploading, progressMap]);

    // Navigation & Actions
    function handleRowClick(id) {
        navigate(`/directory/${id}`);
    }

    function handleFileClick(name, id) {
        window.open(`${BASE_URL}/file/${id}`, '_blank');
    }

    function handleDownload(file) {
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
        if (!itemToDelete) return;

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
            // Show alert
            setAlertConfig({
                title: "Deletion Failed",
                message: error.message,
                isDanger: true
            });
            setShowAlertModal(true);
        } finally {
            setItemToDelete(null);
        }
    }

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
            if (errorData.emailNotFound) {
                const err = new Error("User not found");
                err.emailNotFound = true;
                throw err;
            }
            throw new Error(errorData.error || "Failed to create share link");
        }
        return await response.json();
    }

    return (
        <div className="flex relative h-full gap-4 transition-all duration-300 overflow-hidden">
            {/* Main Content Area */}
            <div className="flex-1 min-w-0 space-y-8 dark:text-gray-100 relative h-full overflow-y-auto pr-2 pb-20">
                {/* Hidden Inputs */}
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-normal text-black dark:text-white mb-1">My Cloud</h1>
                        <p className="text-gray-500 font-bold text-sm">Manage your personal files and folders</p>
                    </div>
                </div>

                {/* Upload Status */}
                {isUploading && (
                    <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-brand-primary">Uploading...</h3>
                            <span className="text-xs font-bold text-brand-primary">{Math.round(avgProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-brand-primary h-full transition-all duration-300 ease-out"
                                style={{ width: `${avgProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <button
                        onClick={() => setShowCreateDirModal(true)}
                        className="bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 px-4 sm:px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors text-sm">
                        <Plus size={18} /> New Folder
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-brand-primary hover:bg-brand-secondary text-white px-4 sm:px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors text-sm">
                        <Upload size={18} /> Upload File
                    </button>
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
                                    className="flex-1 py-3 font-bold bg-brand-primary text-white rounded-xl shadow-lg hover:bg-brand-secondary transition-colors">
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <RecentActivity
                    files={combinedItems}
                    onNavigate={handleRowClick}
                    onFileClick={handleFileClick}
                    onDownload={handleDownload}
                    onDelete={handleDelete}
                    onDetailsClick={setSelectedFile}
                    onShare={handleShareClick}
                />
            </div>

            {/* Side Panel (Responsive Container) */}
            <div className={`transition-all duration-300 ease-in-out shrink-0 ${selectedFile ? 'lg:w-[350px] w-0 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}>
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

export default MyFiles;
