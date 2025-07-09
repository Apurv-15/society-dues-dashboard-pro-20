
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Music, ExternalLink, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cloudinaryConfig, validateAudioFile, formatFileSize, CloudinaryUploadResult } from '@/services/cloudinaryService';

interface SongUploadWidgetProps {
  onUploadSuccess: (url: string, filename: string) => void;
  onRemove: () => void;
  currentSongUrl?: string;
  currentSongName?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export const SongUploadWidget: React.FC<SongUploadWidgetProps> = ({
  onUploadSuccess,
  onRemove,
  currentSongUrl,
  currentSongName,
  disabled
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleUpload = useCallback(() => {
    if (!cloudinaryConfig.cloudName || !cloudinaryConfig.uploadPreset) {
      toast({
        title: "Configuration Error",
        description: "Cloudinary configuration is missing. Please contact administrator.",
        variant: "destructive"
      });
      return;
    }

    if (!window.cloudinary) {
      toast({
        title: "Upload Error",
        description: "Cloudinary widget not loaded. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset,
        sources: ['local', 'url'],
        multiple: false,
        resourceType: 'auto',
        clientAllowedFormats: ['mp3', 'wav', 'm4a', 'ogg', 'aac'],
        maxFileSize: 10000000, // 10MB
        cropping: false,
      },
      (error: any, result: any) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          toast({
            title: "Upload Failed",
            description: "Failed to upload song. Please try again.",
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }

        if (result && result.event === 'success') {
          const uploadResult: CloudinaryUploadResult = result.info;
          console.log('Upload successful:', uploadResult);
          
          onUploadSuccess(uploadResult.secure_url, uploadResult.original_filename);
          toast({
            title: "Upload Successful",
            description: `Song "${uploadResult.original_filename}" uploaded successfully!`
          });
          setIsUploading(false);
        }

        if (result && result.event === 'opened') {
          setIsUploading(true);
        }

        if (result && result.event === 'closed') {
          setIsUploading(false);
        }
      }
    );

    widget.open();
  }, [onUploadSuccess, toast]);

  const handleRemove = () => {
    onRemove();
    toast({
      title: "Song Removed",
      description: "Song has been removed from your registration."
    });
  };

  return (
    <div className="space-y-3">      
      {currentSongUrl && currentSongName ? (
        <div className="border rounded-lg p-4 bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{currentSongName}</p>
                <p className="text-sm text-green-600">Song uploaded successfully</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => window.open(currentSongUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">
            Upload your performance song (MP3, WAV, M4A, OGG)
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleUpload}
            disabled={disabled || isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Choose Song File
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Maximum file size: 10MB
          </p>
        </div>
      )}
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Upload your song file here. The system will store it securely and 
          provide it to event organizers along with your sequence number.
        </p>
      </div>
    </div>
  );
};
