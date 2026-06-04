import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFullMediaUrl(url?: string | null) {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:") ||
    url.startsWith("blob:")
  ) {
    return url;
  }
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `https://medlinkethiopia.pythonanywhere.com${cleanUrl}`;
}

export function parseBackendError(error: any): string {
  if (!error) return 'An unexpected error occurred.';

  // Check for response data (Axios error)
  let data = error?.response?.data;

  // Retrieve default error message
  let message = error?.message || String(error);

  // If the message contains JSON structure (common in native fetch failures)
  if (typeof message === 'string' && message.includes('{')) {
    try {
      const jsonStart = message.indexOf('{');
      const jsonStr = message.substring(jsonStart);
      data = JSON.parse(jsonStr);
    } catch (e) {
      // Not JSON, fallback to standard parsing
    }
  }

  if (data) {
    if (typeof data === 'string') {
      if (data.toLowerCase().includes('allowed extensions are')) {
        return 'Invalid file format. Please upload a valid image or document (PDF, JPG, PNG).';
      }
      return data;
    }

    if (data.detail) {
      return String(data.detail);
    }

    if (data.message) {
      return String(data.message);
    }

    if (data.non_field_errors) {
      const errs = data.non_field_errors;
      return Array.isArray(errs) ? String(errs[0]) : String(errs);
    }

    // Handle dictionary of field errors (e.g. {"medical_documents": {"0": ["..."]}})
    const entries = Object.entries(data);
    if (entries.length > 0) {
      const [field, val] = entries[0];
      
      const formatField = (f: string) => {
        return f
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      };

      const formatValue = (v: any): string => {
        if (!v) return '';
        if (typeof v === 'string') return v;
        if (Array.isArray(v)) return formatValue(v[0]);
        if (typeof v === 'object') {
          const innerVal = Object.values(v)[0];
          return formatValue(innerVal);
        }
        return String(v);
      };

      let errorText = formatValue(val);
      if (errorText) {
        // Clean up common file format errors
        if (errorText.toLowerCase().includes('allowed extensions are')) {
          const fieldLower = field.toLowerCase();
          if (fieldLower.includes('image') || fieldLower.includes('avatar') || fieldLower.includes('photo')) {
            errorText = 'Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP, GIF.';
          } else {
            errorText = 'Invalid file format. Allowed formats: PDF, JPG, JPEG, PNG.';
          }
        }
        return `${formatField(field)}: ${errorText}`;
      }
    }
  }

  if (typeof message === 'string') {
    if (message.startsWith('Update failed') || message.startsWith('Upload failed')) {
      // Return a cleaner version without the full raw response string if it's too long
      const parts = message.split(':');
      if (parts.length > 1 && parts[1].trim().startsWith('{')) {
        return parts[0]; // e.g. "Update failed (400)"
      }
    }
    return message;
  }

  return 'An unexpected error occurred.';
}

/**
 * Ensures a filename has a valid extension based on its MIME type or URI.
 */
export function ensureExtension(uri: string, filename: string, mimeType?: string): string {
  // If filename already has a valid 2-4 char extension, return it
  const match = /\.([a-zA-Z0-9]{2,4})$/.exec(filename);
  if (match) {
    return filename;
  }

  // Otherwise, try to extract extension from the uri
  const uriMatch = /\.([a-zA-Z0-9]{2,4})$/.exec(uri.split('?')[0]);
  if (uriMatch) {
    return `${filename}.${uriMatch[1].toLowerCase()}`;
  }

  // If no extension in URI, try using the mimeType
  if (mimeType) {
    const parts = mimeType.split('/');
    if (parts.length === 2) {
      const ext = parts[1].toLowerCase().replace('jpeg', 'jpg');
      // Ignore generic/wildcard extensions
      if (ext && ext !== 'octet-stream' && ext !== '*') {
        return `${filename}.${ext}`;
      }
    }
  }

  // Fallback to .jpg for safety if it looks like an image, or .bin for other files
  if (mimeType?.startsWith('image/') || uri.startsWith('data:image/')) {
    return `${filename}.jpg`;
  }
  return `${filename}.pdf`;
}

