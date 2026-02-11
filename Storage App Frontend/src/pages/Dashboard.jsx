import React, { useState, useEffect } from 'react';
import { Upload } from 'lucide-react';
import RecentActivity from '../components/RecentActivity';
import FileDetailsPanel from '../components/FileDetailsPanel';
import { useNavigate, useParams } from 'react-router-dom';
import ConfirmationModal from '../components/ConfirmationModal';
import AlertModal from '../components/AlertModal';

const Dashboard = () => {
    const navigate = useNavigate();
    const { dirId } = useParams();
    const BASE_URL = "http://localhost:4000";

    const [directoryName, setDirectoryName] = useState("My Drive");
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

    // Alert Modal State
    const [showAlertModal, setShowAlertModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: '', message: '', isDanger: false });

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

        } catch (error) {
            setErrorMessage(error.message);
        }
    }

    useEffect(() => {
        getDirectoryItems();
        // Clear selection when navigating
        setSelectedFile(null);
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
        setProgressMap(prev => ({ ...prev, [tempId]: 0 }));

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

                // Handle specific errors clearly
                if (initRes.status === 413) {
                    throw new Error(`File "${file.name}" is too large.`);
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
            // We don't necessarily stop isUploading loop because other files might be uploading logic wraps them
        }
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
            }
        } catch (err) {
            console.error(err);
        }
    }

    // Calculated overall progress for the UI
    const activeUploads = Object.values(progressMap);
    const avgProgress = activeUploads.length ? activeUploads.reduce((a, b) => a + b, 0) / activeUploads.length : 0;

    // Auto-hide upload UI when complete
    // Auto-hide upload UI when complete
    useEffect(() => {
        const activeCount = Object.keys(progressMap).length;
        if (isUploading) {
            // If all uploads are done (map empty) or valid progress is 100%
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
        }
    }

    return (
        <div className="flex relative h-full gap-4 transition-all duration-300 overflow-hidden">
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

                {/* Welcome Banner */}
                <div className="mb-4 sm:mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-black dark:text-white mb-1 hidden sm:block">
                        {dirId ? directoryName : "Welcome to Cloud Drive"}
                    </h1>
                    <div className="flex items-baseline gap-2 flex-wrap">
                        {!dirId && <h2 className="text-2xl sm:text-4xl font-bold text-black dark:text-gray-200"><span className="hidden sm:inline">An </span><span className="text-brand-primary">Ai</span> powered Cloud Drive</h2>}
                        {dirId && <p className="text-gray-500 font-medium">Inside {directoryName}</p>}
                    </div>
                </div>

                {/* Upload Area */}
                <div className="bg-gray-200 dark:bg-slate-800 border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center relative mb-8 transition-colors min-h-[250px]">
                    <div className="text-brand-primary mb-4">
                        <Upload size={48} className="mx-auto" />
                    </div>

                    {isUploading ? (
                        <div className="w-full max-w-lg space-y-4">
                            <h3 className="text-xl font-bold text-black dark:text-white animate-pulse">Uploading Files...</h3>
                            <div className="w-full bg-gray-300 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                                <div
                                    className="bg-brand-primary h-full transition-all duration-300 ease-out"
                                    style={{ width: `${avgProgress}%` }}
                                ></div>
                            </div>
                            <p className="text-gray-500 font-bold">{Math.round(avgProgress)}% Complete</p>
                        </div>
                    ) : (
                        <>
                            <h3 className="text-xl font-bold text-black dark:text-white mb-1">
                                {dirId ? `Upload to ${directoryName}` : "Upload Files or Create Directory"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 font-bold mb-8 text-sm sm:text-base hidden sm:block">Drag and drop files here, or click to select files</p>

                            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center max-w-2xl">
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
                                    <button className="flex-1 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-black dark:text-white py-3 sm:py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm border border-gray-200 dark:border-slate-600 transition-all active:scale-95">
                                        Import Drive
                                    </button>
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
                                    className="flex-1 py-3 font-bold bg-brand-primary text-white rounded-xl shadow-lg hover:bg-brand-secondary transition-colors">
                                    Create
                                </button>
                            </div>
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
