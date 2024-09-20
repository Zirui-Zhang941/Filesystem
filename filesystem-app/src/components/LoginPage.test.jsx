/** Importing necessary modules */
import React from 'react';  
import { render, fireEvent } from '@testing-library/react';  
import LoginPage from './LoginPage';  
import { BrowserRouter as Router } from 'react-router-dom';

/** Test suite for LoginPage component */
describe('LoginPage Component', () => {  
  /** Test case to check rendering of login form */
  it('renders login form with inputs and buttons', () => {  
    const { getByPlaceholderText, getByText } = render(  
      <Router>
        <LoginPage />
      </Router>
    );

    /** Assertions for presence of form elements */
    expect(getByPlaceholderText('Username')).toBeInTheDocument();
    expect(getByPlaceholderText('Password')).toBeInTheDocument();
    expect(getByText('Login')).toBeInTheDocument();
    expect(getByText('Register')).toBeInTheDocument();
  });

  /** Test case to check navigation to main page upon login */
  it('navigates to main page upon login button click', () => {  
    const navigateMock = jest.fn();  
    jest.mock('react-router-dom', () => ({  
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigateMock
    }));

    const { getByText } = render(  
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.click(getByText('Login'));  
    expect(navigateMock).toHaveBeenCalledWith('/main');  
  });

  /** Test case to check navigation to register page upon register */
  it('navigates to register page upon register button click', () => {  
    const navigateMock = jest.fn();  
    jest.mock('react-router-dom', () => ({  
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigateMock
    }));

    const { getByText } = render(  
      <Router>
        <LoginPage />
      </Router>
    );

    fireEvent.click(getByText('Register'));  
    expect(navigateMock).toHaveBeenCalledWith('/register');  
  });
});
