import { addTodo, deleteTodo, getTodos, incrementPomodorosCompleted, reorderTodos, toggleTodoCompleted, updateTodo } from '../src/stores/todoStore';

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        clear: () => {
            store = {};
        },
        removeItem: (key: string) => {
            delete store[key];
        },
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

describe('todoStore', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.spyOn(Date, 'now').mockReturnValue(1678886400000); // Consistent timestamp for ID
    });

    it('should return an empty array if no todos are in localStorage', () => {
        expect(getTodos()).toEqual([]);
    });

    it('should add a todo', () => {
        const todos = addTodo('Test Todo', false);
        expect(todos.length).toBe(1);
        expect(todos[0]).toEqual({
            id: '1678886400000',
            text: 'Test Todo',
            priority: false,
            dueDate: undefined,
            completed: false,
            pomodorosCompleted: 0,
        });
        expect(localStorage.getItem('todos')).toBe(JSON.stringify(todos));
    });

    it('should add a todo with a due date', () => {
        const todos = addTodo('Test Todo with Due Date', true, '2025-12-31');
        expect(todos.length).toBe(1);
        expect(todos[0]).toEqual({
            id: '1678886400000',
            text: 'Test Todo with Due Date',
            priority: true,
            dueDate: '2025-12-31',
            completed: false,
            pomodorosCompleted: 0,
        });
    });

    it('should update an existing todo', () => {
        addTodo('Test Todo', false);
        const updatedTodos = updateTodo('1678886400000', { text: 'Updated Todo', completed: true });
        expect(updatedTodos.length).toBe(1);
        expect(updatedTodos[0].text).toBe('Updated Todo');
        expect(updatedTodos[0].completed).toBe(true);
        expect(localStorage.getItem('todos')).toBe(JSON.stringify(updatedTodos));
    });

    it('should not update if todo id does not exist', () => {
        addTodo('Test Todo', false);
        const originalTodos = getTodos();
        const updatedTodos = updateTodo('non-existent-id', { text: 'Non Existent' });
        expect(updatedTodos).toEqual(originalTodos);
    });

    it('should delete a todo', () => {
        addTodo('Test Todo 1', false);
        vi.spyOn(Date, 'now').mockReturnValue(1678886400001); // Mock for the second todo's ID
        addTodo('Test Todo 2', false);
        const updatedTodos = deleteTodo('1678886400000');
        expect(updatedTodos.length).toBe(1);
        expect(updatedTodos[0].text).toBe('Test Todo 2');
        expect(localStorage.getItem('todos')).toBe(JSON.stringify(updatedTodos));
    });

    it('should not delete if todo id does not exist', () => {
        addTodo('Test Todo', false);
        const originalTodos = getTodos();
        const updatedTodos = deleteTodo('non-existent-id');
        expect(updatedTodos).toEqual(originalTodos);
    });

    it('should reorder todos', () => {
        addTodo('Todo 1', false);
        vi.spyOn(Date, 'now').mockReturnValue(1678886400001); // Next ID
        addTodo('Todo 2', false);
        vi.spyOn(Date, 'now').mockReturnValue(1678886400002); // Next ID
        addTodo('Todo 3', true);

        const initialTodos = getTodos();
        expect(initialTodos.map(todo => todo.text)).toEqual(['Todo 1', 'Todo 2', 'Todo 3']);

        const reorderedTodos = reorderTodos(0, 2);
        expect(reorderedTodos.map(todo => todo.text)).toEqual(['Todo 2', 'Todo 3', 'Todo 1']);
        expect(localStorage.getItem('todos')).toBe(JSON.stringify(reorderedTodos));
    });

    it('should toggle todo completed status', () => {
        addTodo('Test Todo', false);
        const todosAfterToggle = toggleTodoCompleted('1678886400000');
        expect(todosAfterToggle[0].completed).toBe(true);

        const todosAfterSecondToggle = toggleTodoCompleted('1678886400000');
        expect(todosAfterSecondToggle[0].completed).toBe(false);
        expect(localStorage.getItem('todos')).toBe(JSON.stringify(todosAfterSecondToggle));
    });

    it('should increment pomodorosCompleted', () => {
        addTodo('Test Todo', false);
        const todosAfterIncrement = incrementPomodorosCompleted('1678886400000');
        expect(todosAfterIncrement[0].pomodorosCompleted).toBe(1);

        const todosAfterSecondIncrement = incrementPomodorosCompleted('1678886400000');
        expect(todosAfterSecondIncrement[0].pomodorosCompleted).toBe(2);
        expect(localStorage.getItem('todos')).toBe(JSON.stringify(todosAfterSecondIncrement));
    });
}); 