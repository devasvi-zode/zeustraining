/**
 * Manages command execution and supports undo/redo functionality
 * using the Command design pattern.
 */
export class CommandManager{
    /**
     * Creates a new CommandManager with empty history and redo stacks.
     */
    constructor(){
        /**
         * @type {Array<Object>}
         * Stores the history of executed commands for undo operations.
         */
        this.history = [];

        /**
         * @type {Array<Object>}
         * Stores commands that have been undone and can be redone.
         */
        this.redoStack = [];
    }

    /**
     * 
     * @param {{execute: Function , undo: Function}} command - The command object to execute
     */
    execute(command){
        command.execute();
        this.history.push(command);
        this.redoStack = [];
    }

    /**
     * Undoes the last executed command, if available.
     * Moves it to the redo stack for potentional re-execution.
     */
    undo(){
        if(this.history.length > 0){
            const command = this.history.pop();
            command.undo();
            this.redoStack.push(command);
        }
    }

    /**
     * Redoes the last undone command, if avialable.
     * Moves it back to the history stack.
     */
    redo(){
        if(this.redoStack.length > 0){
            const command = this.redoStack.pop();
            command.execute();
            this.history.push(command);
        }
    }
}