import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Board from '../../components/Board';
import { BoardProvider } from '../../context/boardProvider';

const wrapper = ({ children }) => <BoardProvider>{children}</BoardProvider>;

describe('Board', () => {
  it('should render board with add list button', () => {
    render(<Board />, { wrapper });
    expect(screen.getByText('+ Add List')).toBeInTheDocument();
  });

  it('should show "No lists yet" message when empty', () => {
    render(<Board />, { wrapper });
    expect(screen.getByText('No lists yet')).toBeInTheDocument();
  });

  it('should add a list when "Add List" button is clicked', async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper });

    const addButton = screen.getByText('+ Add List');
    await user.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('New List')).toBeInTheDocument();
    });
    expect(screen.queryByText('No lists yet')).not.toBeInTheDocument();
  });

  it('should render multiple lists', async () => {
    const user = userEvent.setup();
    render(<Board />, { wrapper });

    const addButton = screen.getByText('+ Add List');
    await user.click(addButton);
    await user.click(addButton);

    await waitFor(() => {
      const lists = screen.getAllByText('New List');
      expect(lists.length).toBe(2);
    });
  });
});

