import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskManagement from '../index';

// Mock the required dependencies
jest.mock('../../utils/logger', () => ({
  logInfo: jest.fn(),
  logError: jest.fn(),
  logWarn: jest.fn()
}));

jest.mock('lucide-react', () => ({
  ListTodo: ({ size }) => <svg size={size} data-testid="list-todo" />,
  Target: ({ size }) => <svg size={size} data-testid="target" />,
  Sparkles: ({ size }) => <svg size={size} data-testid="sparkles" />,
  Plus: ({ size }) => <svg size={size} data-testid="plus" />,
  Clock: ({ size }) => <svg size={size} data-testid="clock" />,
  Edit3: ({ size }) => <svg size={size} data-testid="edit3" />,
  X: ({ size }) => <svg size={size} data-testid="x" />
}));

jest.mock('../HelpSystem', () => ({
  GlobalHelpButton: ({ helpId, onHelpClick, size, variant, className }) => (
    <button 
      data-testid="help-button"
      onClick={onHelpClick}
      className={className}
    >
      Help
    </button>
  )
}));

jest.mock('../TaskList', () => ({
  __esModule: true,
  default: ({ tasks, category }) => (
    <div data-testid="task-list" data-category={category}>
      {tasks.map(task => (
        <div key={task.id} data-testid={`task-${task.id}`}>
          {task.text || task.name}
        </div>
      ))}
    </div>
  )
}));

jest.mock('../DiceTaskList', () => ({
  __esModule: true,
  default: ({ pendingTasks, completedTasks, abandonedTasks }) => (
    <div data-testid="dice-task-list">
      <div data-testid="pending-tasks">
        {pendingTasks.map(task => (
          <div key={task.id} data-testid={`dice-task-${task.id}`}>
            {task.task?.text || task.task?.name}
          </div>
        ))}
      </div>
    </div>
  )
}));

jest.mock('../../FateDice', () => ({
  __esModule: true,
  default: ({ theme, diceState }) => (
    <div data-testid="fate-dice" data-theme={theme}>
      Fate Dice
    </div>
  )
}));

// Test data
const mockHabitTasks = [
  {
    id: 'habit-1',
    name: '每日阅读',
    reward: 10,
    xp: 15,
    duration: 30,
    streak: 5,
    color: '#8b5cf6',
    attr: 'DISCIPLINE',
    archived: false,
    history: {},
    logs: {},
    priority: 'medium'
  }
];

const mockProjectTasks = [
  {
    id: 'project-1',
    text: '完成项目初稿',
    subTasks: [
      {
        id: 'subtask-1',
        text: '收集资料',
        completed: false,
        duration: 60,
        xp: 50,
        gold: 20
      },
      {
        id: 'subtask-2',
        text: '撰写大纲',
        completed: false,
        duration: 90,
        xp: 75,
        gold: 30
      }
    ],
    completed: false,
    xp: 200,
    gold: 100,
    priority: 'high'
  }
];

const mockDiceState = {
  pendingTasks: [],
  completedTasks: [],
  abandonedTasks: [],
  todayCount: 0,
  lastClickDate: new Date().toLocaleDateString(),
  config: {
    dailyLimit: 3,
    categoryDistribution: {
      health: 25,
      wealth: 25,
      career: 25,
      relationships: 25
    }
  },
  taskPool: {
    health: [],
    wealth: [],
    career: [],
    relationships: []
  },
  history: [],
  completedTaskIds: [],
  currentResult: undefined,
  isSpinning: false
};

const mockProps = {
  balance: 1000,
  onUpdateBalance: jest.fn(),
  habitTasks: mockHabitTasks,
  projectTasks: mockProjectTasks,
  diceState: mockDiceState,
  habits: mockHabitTasks,
  projects: mockProjectTasks,
  taskCategory: 'daily',
  setTaskCategory: jest.fn(),
  onCompleteTask: jest.fn(),
  onGiveUpTask: jest.fn(),
  onOpenEditTask: jest.fn(),
  onToggleSubTask: jest.fn(),
  onGiveUpSubTask: jest.fn(),
  onStartTimer: jest.fn(),
  onDragStart: jest.fn(),
  onDragEnd: jest.fn(),
  onDragOver: jest.fn(),
  draggedTask: null,
  onSpinDice: jest.fn(),
  onUpdateDiceState: jest.fn(),
  onDiceResult: jest.fn(),
  onChangeDuration: jest.fn(),
  onToggleTimer: jest.fn(),
  onAddFloatingReward: jest.fn(),
  theme: 'neomorphic-light',
  cardBg: 'bg-white',
  textMain: 'text-black',
  textSub: 'text-gray-600',
  isDark: false,
  isNeomorphic: true,
  onShowHelp: jest.fn(),
  todayStr: new Date().toLocaleDateString(),
  setIsImmersive: jest.fn(),
  onAddTask: jest.fn(),
  onOpenTaskManagement: jest.fn(),
  setIsNavCollapsed: jest.fn()
};

describe('TaskManagement Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders without crashing', () => {
    const { container } = render(<TaskManagement {...mockProps} />);
    expect(container).toBeInTheDocument();
  });

  test('renders task category buttons', () => {
    render(<TaskManagement {...mockProps} />);
    
    expect(screen.getByText('日常显化')).toBeInTheDocument();
    expect(screen.getByText('时间盒子')).toBeInTheDocument();
    expect(screen.getByText('命运骰子')).toBeInTheDocument();
    expect(screen.getByText('管理')).toBeInTheDocument();
  });

  test('switches task category when button is clicked', () => {
    render(<TaskManagement {...mockProps} />);
    
    fireEvent.click(screen.getByText('时间盒子'));
    expect(mockProps.setTaskCategory).toHaveBeenCalledWith('timebox');
    
    fireEvent.click(screen.getByText('命运骰子'));
    expect(mockProps.setTaskCategory).toHaveBeenCalledWith('random');
    
    fireEvent.click(screen.getByText('日常显化'));
    expect(mockProps.setTaskCategory).toHaveBeenCalledWith('daily');
  });

  test('renders task list for daily category', () => {
    render(<TaskManagement {...mockProps} taskCategory="daily" />);
    
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByTestId('task-list')).toHaveAttribute('data-category', 'daily');
    expect(screen.getByTestId('task-habit-1')).toBeInTheDocument();
  });

  test('renders task list for main category', () => {
    render(<TaskManagement {...mockProps} taskCategory="main" />);
    
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByTestId('task-list')).toHaveAttribute('data-category', 'main');
    expect(screen.getByTestId('task-project-1')).toBeInTheDocument();
  });

  test('renders dice task list for random category', () => {
    render(<TaskManagement {...mockProps} taskCategory="random" />);
    
    expect(screen.getByTestId('fate-dice')).toBeInTheDocument();
    expect(screen.getByTestId('dice-task-list')).toBeInTheDocument();
  });

  test('renders help button when onShowHelp is provided', () => {
    render(<TaskManagement {...mockProps} onShowHelp={jest.fn()} />);
    
    expect(screen.getByTestId('help-button')).toBeInTheDocument();
  });

  test('does not render help button when onShowHelp is not provided', () => {
    render(<TaskManagement {...mockProps} onShowHelp={undefined} />);
    
    expect(screen.queryByTestId('help-button')).not.toBeInTheDocument();
  });

  test('calls onOpenTaskManagement when manage button is clicked', () => {
    render(<TaskManagement {...mockProps} />);
    
    fireEvent.click(screen.getByText('管理'));
    expect(mockProps.onOpenTaskManagement).toHaveBeenCalled();
  });
});
