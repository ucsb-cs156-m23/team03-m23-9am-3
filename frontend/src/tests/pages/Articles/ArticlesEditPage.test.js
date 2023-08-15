import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import ArticlesEditPage from "main/pages/Articles/ArticlesEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

import mockConsole from "jest-mock-console";

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
        useParams: () => ({
            id: 15
        }),
        Navigate: (x) => { mockNavigate(x); return null; }
    };
});

describe("ArticlesEditPage tests", () => {

    describe("when the backend doesn't return data", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/articles", { params: { id: 15 } }).timeout();
        });

        const queryClient = new QueryClient();
        test("renders header but table is not present", async () => {

            const restoreConsole = mockConsole();

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
            await screen.findByText("Edit Articles");
            expect(screen.queryByTestId("ArticlesForm-title")).not.toBeInTheDocument();
            restoreConsole();
        });
    });

    describe("tests where backend is working normally", () => {

        const axiosMock = new AxiosMockAdapter(axios);

        beforeEach(() => {
            axiosMock.reset();
            axiosMock.resetHistory();
            axiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
            axiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
            axiosMock.onGet("/api/articles", { params: { id: 15 } }).reply(200, {
                id: 15,
                title: "Using testing-playground with React Testing Library",
                url: "https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7",
                explanation: "Helpful when we get to front end development",
                email: "phtcon@ucsb.edu",
                DateAdded: "2022-04-20T00:00:00"
            });
            axiosMock.onPut('/api/articles').reply(200, {
                id: "15",
                title: "Handy Spring Utility Classes",
                url: "https://twitter.com/maciejwalkowiak/status/1511736828369719300?t=gGXpmBH4y4eY9OBSUInZEg&s=09",
                explanation: "A lot of really useful classes are built into Spring",
                email: "cgaucho@ucsb.edu",
                DateAdded: "2022-04-19T00:00:00"
            });
        });

        const queryClient = new QueryClient();
        test("renders without crashing", () => {
            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );
        });

        test("Is populated with the data provided", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("ArticlesForm-title");

            const idField = screen.getByTestId("ArticlesForm-id");
            const titleField = screen.getByTestId("ArticlesForm-title");
            const urlField = screen.getByTestId("ArticlesForm-url");
            const explanationField = screen.getByTestId("ArticlesForm-explanation");
            const emailField = screen.getByTestId("Articles-email");
            const DateAddedField = screen.getByTestId("ArticlesForm-DateAdded");
            const submitButton = screen.getByTestId("ArticlesForm-submit");

            expect(idField).toHaveValue("15");
            expect(titleField).toHaveValue("Using testing-playground with React Testing Library");
            expect(urlField).toHaveValue("https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7");
            expect(explanationField).toHaveValue("Helpful when we get to front end development");
            expect(emailField).toHaveValue("phtcon@ucsb.edu");
            expect(DateAddedField).toHaveValue("2022-04-20T00:00:00");
            expect(submitButton).toBeInTheDocument();
        });

        test("Changes when you click Update", async () => {

            render(
                <QueryClientProvider client={queryClient}>
                    <MemoryRouter>
                        <ArticlesEditPage />
                    </MemoryRouter>
                </QueryClientProvider>
            );

            await screen.findByTestId("ArticlesForm-title");

            const idField = screen.getByTestId("ArticlesForm-id");
            const titleField = screen.getByTestId("ArticlesForm-title");
            const urlField = screen.getByTestId("ArticlesForm-url");
            const explanationField = screen.getByTestId("ArticlesForm-explanation");
            const emailField = screen.getByTestId("Articles-email");
            const DateAddedField = screen.getByTestId("ArticlesForm-DateAdded");
            const submitButton = screen.getByTestId("ArticlesForm-submit");

            expect(idField).toHaveValue("15");
            expect(titleField).toHaveValue("Using testing-playground with React Testing Library");
            expect(urlField).toHaveValue("https://dev.to/katieraby/using-testing-playground-with-react-testing-library-26j7");
            expect(explanationField).toHaveValue("Helpful when we get to front end development");
            expect(emailField).toHaveValue("phtcon@ucsb.edu");
            expect(DateAddedField).toHaveValue("2022-04-20T00:00:00");

            expect(submitButton).toBeInTheDocument();

            fireEvent.change(titleField, { target: { value: 'Handy Spring Utility Classes' } })
            fireEvent.change(urlField, { target: { value: 'https://twitter.com/maciejwalkowiak/status/1511736828369719300?t=gGXpmBH4y4eY9OBSUInZEg&s=09' } })
            fireEvent.change(explanationField, { target: { value: 'A lot of really useful classes are built into Spring' } })
            fireEvent.change(emailField, { target: { value: 'cgaucho@ucsb.edu' } })
            fireEvent.change(DateAddedField, { target: { value: '2022-04-19T00:00:00' } })

            fireEvent.click(submitButton);

            await waitFor(() => expect(mockToast).toBeCalled());
            expect(mockToast).toBeCalledWith("Articles Updated - id: 15 title: Handy Spring Utility Classes");
            expect(mockNavigate).toBeCalledWith({ "to": "/articles" });

            expect(axiosMock.history.put.length).toBe(1); // times called
            expect(axiosMock.history.put[0].params).toEqual({ id: 15 });
            expect(axiosMock.history.put[0].data).toBe(JSON.stringify({
                title: "Handy Spring Utility Classes",
                url: "https://twitter.com/maciejwalkowiak/status/1511736828369719300?t=gGXpmBH4y4eY9OBSUInZEg&s=09",
                explanation: "A lot of really useful classes are built into Spring",
                email: "cgaucho@ucsb.edu",
                DateAdded: "2022-04-19T00:00:00"
            })); // posted object

        });

       
    });
});


