import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../App';
import { BoardProvider } from '../../context/boardProvider';

// Mock useOfflineSync to avoid IndexedDB issues in tests
jest.mock('../../hooks/useOfflineSync', () => ({
  useOfflineSync: jest.fn(),
}));

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>;

describe('App', () => {
  it('should render app header with title', () => {
    render(<App />, { wrapper });
    expect(screen.getByText('Kanban Board')).toBeInTheDocument();
  });

  it('should render undo and redo buttons', () => {
    render(<App />, { wrapper });
    expect(screen.getByText('Undo')).toBeInTheDocument();
    expect(screen.getByText('Redo')).toBeInTheDocument();
  });

  it('should render Board component', () => {
    render(<App />, { wrapper });
    expect(screen.getByText('+ Add List')).toBeInTheDocument();
  });

  it('should handle undo keyboard shortcut', async () => {
    const user = userEvent.setup();
    render(<App />, { wrapper });

    // Add a list first
    const addButton = screen.getByText('+ Add List');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New List')).toBeInTheDocument();
    });

    // Press Ctrl+Z (or Cmd+Z on Mac)
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    if (isMac) {
      await user.keyboard('{Meta>}z{/Meta}');
    } else {
      await user.keyboard('{Control>}z{/Control}');
    }

    await waitFor(() => {
      expect(screen.queryByText('New List')).not.toBeInTheDocument();
    });
  });
});

