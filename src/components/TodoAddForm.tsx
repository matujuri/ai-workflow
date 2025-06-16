import React, { useState } from 'react';

interface TodoAddFormProps {
    onAddTodo: (text: string, isPriority: boolean, dueDate?: string) => void;
}

const TodoAddForm: React.FC<TodoAddFormProps> = ({ onAddTodo }) => {
    const [inputText, setInputText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputText.trim()) {
            // 優先度と期日はデフォルト値（仮）
            onAddTodo(inputText, false, undefined);
            setInputText('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex justify-between items-center p-4 bg-white shadow-lg fixed bottom-0 left-0 right-0 z-50">
            <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="新しいTODOを追加..."
                className="flex-grow p-2 mr-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                type="submit"
                className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200 min-w-[80px]"
            >
                追加
            </button>
        </form>
    );
};

export default TodoAddForm; 