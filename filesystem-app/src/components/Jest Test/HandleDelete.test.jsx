import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Import BrowserRouter
import { MemoryRouter } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';
import MainPage from '../MainPage.jsx';

test('deletes a file when the delete button is clicked', () => {
    const { getByText, getByTestId, queryByText } = render(
        <MemoryRouter>
            <MainPage />
        </MemoryRouter>
    );
    // Click on the "Delete" button to open the delete section
    fireEvent.click(getByText('Delete'));

    // Find the select element and select the first file
    const selectElement = getByTestId('file-select');
    fireEvent.change(selectElement, { target: { value: 'File1.txt' } });

    // Find and click the "Confirm" button
    const confirmButton = getByText('Confirm');
    fireEvent.click(confirmButton);

    // Check if the file is deleted
    expect(queryByText('File1.txt')).toBeNull();
});