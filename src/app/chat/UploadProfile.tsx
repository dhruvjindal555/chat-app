'use client'
import React, { Dispatch, SetStateAction ,Children, useEffect, ComponentRef, RefObject } from 'react'
import { CldUploadWidget } from 'next-cloudinary';
import { toast } from 'react-toastify';
import { useUserProfileStore } from '@/store/UserProfileStore';


interface CloudinaryResult {
    info: {
        files: [{
            public_id: string;
            uploadInfo: {
                secure_url: string;
            };
        }]
    };
    event: string;
}

interface CloudinaryError {
    status: string
    statusText: string
}

interface UploadProfileProps{
    fileRef : RefObject<HTMLButtonElement|null> ;
    // setImageUrl : Dispatch<SetStateAction<string>>;
    handleProfileUpdate :  (str: string) => void;
}

const UploadProfile = (props: UploadProfileProps) => {
    const setImageUrl = useUserProfileStore((state) => state.setImageUrl)
    return (
        <CldUploadWidget
            signatureEndpoint="/api/sign-cloudinary-params"
            options={{
                maxFileSize: 2 * 1024 * 1024, // 2MB max
                resourceType: 'image', // <- restrict to image uploads
                clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'], // supported image formats
                sources: ['local'],
                multiple: false,
                maxFiles: 1,
                singleUploadAutoClose: false,
                cropping: true,       // enables cropping
                croppingAspectRatio: 1, // optional, e.g. 1 = square crop
                croppingShowBackButton: true, // optional, adds a back button
                styles: {
                    palette: {
                        window: '#1F1F1F',           // dark background
                        windowBorder: '#333333',     // subtle border
                        menuIcons: '#BBBBBB',        // muted icons
                        textDark: '#FFFFFF',         // primary text
                        textLight: '#000000', // <-- a mid‑grey for "Or"
                        link: '#1E88E5',             // accent link
                        action: '#43A047',           // action buttons
                        inactiveTabIcon: '#777777',  // inactive tabs
                        error: '#E53935',            // errors
                        inProgress: '#FB8C00'        // progress bar
                    },
                    fonts: {
                        // Use Google’s Poppins for a clean, modern feel
                        "'Poppins', sans-serif": {
                            url: "https://fonts.googleapis.com/css?family=Poppins:400,500,600",
                            active: true
                        }
                    }
                }
            }}
        >
            {({ open, results, error }) => {

                useEffect(() => {
                    if (error) {
                        const typedErrors = error as CloudinaryError
                        console.log(typedErrors.statusText);
                        toast.error(typedErrors.statusText.slice(0, 1).toUpperCase() + typedErrors.statusText.slice(1).toLowerCase())
                    }


                    const typedResults = results as CloudinaryResult | undefined;
                    // console.log(typedResults);

                    if (typedResults?.event === "queues-end"
                        && typedResults.info.files[0]?.uploadInfo?.secure_url) {
                        const imageUrl = typedResults.info.files[0].uploadInfo?.secure_url;
                        console.log('✅ Uploaded image URL:', imageUrl);
                        setImageUrl(imageUrl);
                        props.handleProfileUpdate(imageUrl)
                    }
                }, [results]);

                return (
                    <>
                        <button className="hidden" ref={props.fileRef} onClick={() => open()}>
                            Upload an Image
                        </button>
                    </>
                );
            }}

        </CldUploadWidget >
    )
}
export default UploadProfile