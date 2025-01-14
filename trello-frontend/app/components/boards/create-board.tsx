'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createBoard } from '../../services/boardService';
import FormSubmit from '../atomic/form-submit';
import ImagesForm from '../atomic/images-form';
import InputForm from '../atomic/input-form';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

const CreateBoardPopup = () => {
    const router = useRouter();

    const handleCreateBoard = async (formData: FormData) => {
        const title = formData.get('title') as string;
        const image = formData.get('image') as string;

        if (!title || !image) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            // Prepare the payload with default or dynamic userIds
            const userIds = [
                'demo.user1@example.com',
                'demo.user2@example.com',
            ]; // Replace with dynamic emails if needed

            const newBoard = await createBoard({
                title,
                image,
                userIds,
                lists: [], // Optional: Adjust if lists/cards are needed
                cards: [],
            });

            if (newBoard && newBoard.id) {
                toast.success('Board successfully added');
                router.push(`/board/${newBoard.id}`); // Navigate to the new board's page
            } else {
                toast.error('Failed to retrieve new board ID');
            }
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Board not created';
            toast.error(errorMessage);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        handleCreateBoard(formData);
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="btn btn-primary">Create new board</button>
            </PopoverTrigger>
            <PopoverContent>
                <form onSubmit={handleFormSubmit}>
                    <h3>Create Board</h3>
                    <InputForm id="title" name="title" label="Board Title" placeholder="Enter title" />
                    <ImagesForm name="image" />
                    <FormSubmit> Create Board </FormSubmit>
                </form>
            </PopoverContent>
        </Popover>
    );
};

export default CreateBoardPopup;
