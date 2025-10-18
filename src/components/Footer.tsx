import { Button, FileUpload, type FileUploadFileAcceptDetails } from '@chakra-ui/react';
import { MdAudioFile } from "react-icons/md";
import '../stylesheets/Footer.css'
import { AudioURLContext, VisualizerContext } from '../App';
import type { AudioFileURL, VisualizerState } from '../types/visual-types';
import { useContext } from 'react';
import { toast } from 'react-toastify';

export default function Footer() {
    const { setFileURL }: AudioFileURL = useContext(AudioURLContext);
    const { visualize, setVisualize }: VisualizerState = useContext(VisualizerContext);
    const handleFileAccept = (details: FileUploadFileAcceptDetails) => {
        const { files } = details;
        if (files.length > 0) {
            const file = files[0];
            const audioURL = URL.createObjectURL(file);
            if (audioURL === undefined || audioURL === '') {
                toast.error('Something went wrong when accessing the uploaded audio file. Please try again.');
                return;
            }
            console.log(audioURL);
            setFileURL(audioURL);
        }
    }

    return !visualize ? (
        <div className='footer'>
            <p className='label'>Click on the sphere to activate your microphone or upload a song of your choice below!</p>
            <FileUpload.Root
                accept={["audio/mpeg"]}
                maxFiles={1}
                maxFileSize={1000000}
                onFileAccept={handleFileAccept}
            >
                <FileUpload.HiddenInput />
                <FileUpload.Trigger asChild>
                    <Button
                        variant="subtle"
                        size="sm"
                        style={{ "margin": "auto" }}
                    >
                        <MdAudioFile /> Upload file
                    </Button>
                </FileUpload.Trigger>
                <FileUpload.List />
            </FileUpload.Root>
        </div>
    ) : (
        <Button
            variant="subtle"
            size="sm"
            style={{ "margin": "auto" }}
            onClick={() => setVisualize(false)}
        >
            Cancel
        </Button>
    )
}