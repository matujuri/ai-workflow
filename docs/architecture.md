# アーキテクチャ図

## 1. システムアーキテクチャ

```mermaid
C4Context
    title System Context for TODO Management Web App
    Enterprise_Boundary(b_enterprise, "TODO Management System") {
        Person(user, "User", "Individual managing TODOs and using pomodoro timer")
        System(spa, "React SPA", "Single Page Application running in web browser")
        System_Ext(localStorage, "Local Storage", "Web browser's data storage")

        Rel(user, spa, "Uses")
        Rel(spa, localStorage, "Reads and writes TODO data")
    }
```

## 2. コンポーネント構成

```mermaid
C4Container
    title Container Diagram for React SPA

    Container(react_app, "React Application", "Web App")

    Boundary(react_app_boundary, "React Application Components") {
        Component(app_component, "App", "React Component", "Overall layout and routing")
        Component(todo_list_component, "TodoList", "React Component", "Displays and reorders TODO items")
        Component(todo_item_component, "TodoItem", "React Component", "Individual TODO item, triggers pomodoro")
        Component(todo_form_component, "TodoForm", "React Component", "Form for adding/editing TODOs")
        Component(pomodoro_timer_component, "PomodoroTimer", "React Component", "Pomodoro timer display and controls")

        Component(todo_store, "TodoStore", "TypeScript Module", "Manages TODO data and local storage")
        Component(use_pomodoro_timer_hook, "usePomodoroTimer Hook", "TypeScript Hook", "Pomodoro timer logic")
        Component(timer_module, "Timer Module", "TypeScript Module", "Helper functions for timer calculations and notifications")
    }

    System_Ext(localStorage_ext, "Local Storage", "Web browser's data storage")

    Rel(react_app, app_component, "Contains")
    Rel(react_app, todo_list_component, "Contains")
    Rel(react_app, todo_form_component, "Contains")
    Rel(react_app, pomodoro_timer_component, "Contains")
    Rel(react_app, todo_store, "Contains")
    Rel(react_app, use_pomodoro_timer_hook, "Contains")
    Rel(react_app, timer_module, "Contains")

    Rel(todo_list_component, todo_item_component, "Renders")

    Rel(todo_list_component, todo_store, "Fetches/Updates data")
    Rel(todo_form_component, todo_store, "Adds/Edits data")
    Rel(todo_item_component, todo_store, "Updates/Deletes data")

    Rel(todo_item_component, use_pomodoro_timer_hook, "Triggers timer actions")
    Rel(pomodoro_timer_component, use_pomodoro_timer_hook, "Uses timer logic")
    Rel(use_pomodoro_timer_hook, timer_module, "Uses helper functions")

    Rel(todo_store, localStorage_ext, "Reads/Writes data")
```

## 3. 依存関係

- **Frontend Framework**: React
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API / useState
- **Data Persistence**: Local Storage (browser feature)
- **Custom Hooks**: usePomodoroTimer (reusable timer logic)
- **Utility Functions**: Helper functions for timer calculations and notifications (src/utils/timer.ts)