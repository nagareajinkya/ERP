import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../src/api';

/**
 * Reusable Image Uploader Component
 * Supports drag-and-drop, file selection, and preview
 * 
 * @param {Object} props
 * @param {'profile-photo' | 'signature' | 'stamp'} props.imageType - Type of image to upload
 * @param {string} props.currentImageUrl - Current image URL (if any)
 * @param {function} props.onUploadSuccess - Callback after successful upload
 * @param {function} props.onUploadError - Callback on error
 * @param {boolean} props.disabled - Disable upload functionality
 */
const ImageUploader = ({
    imageType,
    currentImageUrl,
    onUploadSuccess,
    onUploadError,
    disabled = false
}) => {
    const [preview, setPreview] = useState(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Constants
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

    // Get endpoint based on type
    const getEndpoint = () => {
        switch (imageType) {
            case 'profile-photo':
                return '/auth/upload/profile-photo';
            case 'signature':
                return '/auth/upload/signature';
            case 'stamp':
                return '/auth/upload/stamp';
            default:
                return '/auth/upload/profile-photo';
        }
    };

    // Validate file
    const validateFile = (file) => {
        if (!file) {
            return 'No file selected';
        }

        if (!ALLOWED_TYPES.includes(file.type.toLowerCase())) {
            return 'Only PNG and JPG images are allowed';
        }

        if (file.size > MAX_FILE_SIZE) {
            return 'File size must be less than 5MB';
        }

        return null;
    };

    // Handle file selection
    const handleFileSelect = async (file) => {
        if (!file || disabled) return;

        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            if (onUploadError) onUploadError(validationError);
            return;
        }

        setError(null);

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        await uploadFile(file);
    };

    // Upload file to server
    const uploadFile = async (file) => {
        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post(getEndpoint(), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Success
            if (onUploadSuccess) {
                onUploadSuccess(response.data);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Failed to upload image';
            setError(errorMessage);
            setPreview(currentImageUrl || null); // Revert to previous image
            if (onUploadError) onUploadError(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    // Handle drop
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Handle file input change
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    // Get display text based on image type
    const getDisplayText = () => {
        switch (imageType) {
            case 'profile-photo':
                return { title: 'Profile Photo', hint: 'Upload your business logo or profile picture' };
            case 'signature':
                return { title: 'Signature', hint: 'Upload authorized signatory signature' };
            case 'stamp':
                return { title: 'Business Stamp', hint: 'Upload your official business stamp' };
            default:
                return { title: 'Image', hint: 'Upload an image' };
        }
    };

    const displayText = getDisplayText();

    return (
        <div className="w-full">
            {/* Upload Area */}
            <div
                className={`relative border-2 border-dashed rounded-xl transition-all ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : error
                            ? 'border-red-300 bg-red-50'
                            : 'border-gray-300 bg-gray-50'
                    } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    disabled={disabled || uploading}
                    className="hidden"
                />

                {/* Preview or Upload UI */}
                <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                            <p className="text-sm font-medium text-gray-600">Uploading...</p>
                        </div>
                    ) : preview ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                            <img
                                src={preview}
                                alt={displayText.title}
                                className="max-h-40 max-w-full rounded-lg shadow-sm object-contain"
                            />
                            {!disabled && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Change Image
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className={`p-4 rounded-full ${error ? 'bg-red-100' : 'bg-blue-100'}`}>
                                {error ? (
                                    <AlertCircle className={`w-8 h-8 ${error ? 'text-red-600' : 'text-blue-600'}`} />
                                ) : (
                                    <Upload className="w-8 h-8 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-700">{displayText.hint}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Drag and drop or click to browse
                                </p>
                            </div>
                            <p className="text-xs text-gray-400">PNG or JPG (Max 5MB)</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
