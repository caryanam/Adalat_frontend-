/**
 * Utility to format and resolve full URLs for uploaded media (profile photos, documents, etc.)
 * Always points to the backend server (e.g. http://localhost:8082).
 */
export const formatImageUrl = (raw) => {
  if (!raw) return null;

  // Extract string if an object (e.g. lawyer, document, user) was passed
  let url = '';
  if (typeof raw === 'string') {
    url = raw.trim();
  } else if (typeof raw === 'object') {
    url = (
      raw.profileImage ||
      raw.profile?.profileImage ||
      raw.profile?.profilePhotoUrl ||
      raw.profilePhotoUrl ||
      raw.photoUrl ||
      raw.lawyerProfileImageUrl ||
      raw.fileUrl ||
      raw.file_url ||
      raw.dataUrl ||
      raw.imageUrl ||
      raw.avatar ||
      raw.avatarUrl ||
      raw.profilePictureUrl ||
      raw.profilePicture ||
      raw.image ||
      ''
    );
    if (typeof url === 'string') {
      url = url.trim();
    } else {
      return null;
    }
  }

  if (!url) return null;

  // Ignore invalid placeholders or object strings
  if (url === '[object Object]' || url === 'undefined' || url === 'null') {
    return null;
  }

  // Already a full HTTP/HTTPS URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // If the database has hardcoded localhost URLs, dynamically replace them so they work on local network devices
    return url.replace(/https?:\/\/localhost:\d+/i, `http://${window.location.hostname}:8082`);
  }

  // Temporary client-side preview (blob or base64) if used strictly during active file picking
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  // Relative path like '/uploads/lawyers/...' or 'uploads/lawyers/...'
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `http://${window.location.hostname}:8082${cleanPath}`;
};

export default formatImageUrl;
