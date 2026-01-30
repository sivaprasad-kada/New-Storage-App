export const getFileCategory = (filename, mimetype) => {
    const ext = filename.split('.').pop().toLowerCase();

    // 1. Check Mime Type (if available and reliable)
    if (mimetype) {
        if (mimetype.startsWith('image/')) return 'image';
        if (mimetype.startsWith('video/')) return 'video';
        if (mimetype.startsWith('audio/')) return 'audio';
    }

    // 2. Fallback to Extension
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'];
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'wmv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'];
    const docExts = ['pdf', 'doc', 'docx', 'txt', 'ppt', 'pptx', 'xls', 'xlsx', 'csv', 'md'];

    if (imageExts.includes(ext)) return 'image';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (docExts.includes(ext)) return 'document';

    return 'other';
};
