import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import ArticlesCreatePage from "main/pages/Articles/ArticlesCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock('react-toastify', () => {
    const originalModule = jest.requireActual('react-toastify');
    return {
        __esModule: true,
        ...originalModule,
        toast: (x) => mockToast(x)
    };
});

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("ArticlesCreatePage tests", () => {

    const axiosMock =new AxiosMockAdapter(axios);

    beforeEach(() => {
        axiosMock.reset();
        axiosMock.resetHistory();
        axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
        axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    });

    test("renders without crashing", () => {
        const queryClient = new QueryClient();
        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ArticlesCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );
    });

    test("when you fill in the form and hit submit, it makes a request to the backend", async () => {

        const queryClient = new QueryClient();
        const articles = {
            id: 15,
            title: "Using testing-playground with React Testing Library",
            url: "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
            explanation: "Helpful when we get to front end development",
            email: "phtcon@ucsb.edu",
            DateAdded: "2022-04-20T00:00:00"
        };

        axiosMock.onPost("/api/articles/post").reply( 202, articles );

        render(
            <QueryClientProvider client={queryClient}>
                <MemoryRouter>
                    <ArticlesCreatePage />
                </MemoryRouter>
            </QueryClientProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId("ArticlesForm-title")).toBeInTheDocument();
        });

        const titleField = screen.getByTestId("ArticlesForm-title");
        const urlField = screen.getByTestId("ArticlesForm-url");
        const explanationField = screen.getByTestId("ArticlesForm-explanation");
        const emailField = screen.getByTestId("ArticlesForm-email");
        const DateAddedField = screen.getByTestId("ArticlesForm-DateAdded");
        const submitButton = screen.getByTestId("ArticlesForm-submit");

        fireEvent.change(titleField, { target: { value: 'Using testing-playground with React Testing Library' } });
        fireEvent.change(urlField, { target: { value: 'https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7' } });
        fireEvent.change(explanationField, { target: { value: 'Helpful when we get to front end development' } });
        fireEvent.change(emailField, { target: { value: 'phtcon@ucsb.edu' } });
        fireEvent.change(DateAddedField, { target: { value: '2022-04-20T00:00:00' } });

        expect(submitButton).toBeInTheDocument();

        fireEvent.click(submitButton);

        await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

        expect(axiosMock.history.post[0].params).toEqual(
            {
            "DateAdded": "2022-04-20T00:00:00",
            "email": "phtcon@ucsb.edu",
            "explanation": "Helpful when we get to front end development",
            "url": "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
            "title": "Using testing-playground with React Testing Library"
        });

        expect(mockToast).toBeCalledWith("New article Created - id: 15 title: Using testing-playground with React Testing Library");
        expect(mockNavigate).toBeCalledWith({ "to": "/articles" });
    });


});


