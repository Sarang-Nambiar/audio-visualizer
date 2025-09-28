import { Button, FileUpload } from '@chakra-ui/react';
import { MdAudioFile } from "react-icons/md";
import '../stylesheets/Footer.css'

export default function Footer() {
    return (
        <div className="footer">
            <p className='label'>Click on the sphere to activate your microphone or upload a song of your choice below!</p>
            <FileUpload.Root accept={["audio/mpeg"]} maxFiles={1} maxFileSize={1000000}>
                <FileUpload.HiddenInput />
                <FileUpload.Trigger asChild>
                    <Button variant="subtle" size="sm" style={{ "margin": "auto" }}>
                        <MdAudioFile /> Upload file
                    </Button>
                </FileUpload.Trigger>
                <FileUpload.List />
            </FileUpload.Root>
        </div>
    )
}