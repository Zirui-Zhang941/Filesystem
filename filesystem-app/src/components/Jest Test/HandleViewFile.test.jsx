import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainPage from '../MainPage.jsx';

/* test case to check if a modal opens when file clicked so contents can be viewed
 */
test('modal opens when a file is clicked', () => {
    const { getByText } = render(
        <MemoryRouter>
            <MainPage />
        </MemoryRouter>
    );

    // Click on the file in the sidebar
    fireEvent.click(getByText('file1.txt'));

    // Check if the modal with file details is rendered
    const modalTitle = getByText('File1.txt');
    expect(modalTitle).toBeInTheDocument();
});
