import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import UCSBOrganizationsForm from "main/components/UCSBOrganizations/UCSBOrganizationsForm";
import { ucsbOrganizationsFixtures } from "fixtures/ucsbOrganizationsFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate
}));

describe("UCSBOrganizationsForm tests", () => {
    const queryClient = new QueryClient();

    const expectedHeaders = ["OrgTranslationShort", "OrgTranslation", "Inactive"];
    const testId = "UCSBOrganizationsForm";

    test("renders correctly with no initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

    });

    test("renders correctly when passing in initialContents", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm initialContents={ucsbOrganizationsFixtures.oneOrganization} />
                </Router>
            </QueryClientProvider>
        );

        expect(await screen.findByText(/Create/)).toBeInTheDocument();

        expectedHeaders.forEach((headerText) => {
            const header = screen.getByText(headerText);
            expect(header).toBeInTheDocument();
        });

        expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
        expect(screen.getByText(`OrgCode`)).toBeInTheDocument();
    });


    test("that navigate(-1) is called when Cancel is clicked", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm />
                </Router>
            </QueryClientProvider>
        );
        expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
        const cancelButton = screen.getByTestId(`${testId}-cancel`);

        fireEvent.click(cancelButton);

        await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
    });

    test("that the correct validations are performed", async () => {
        render(
            <QueryClientProvider client={queryClient}>
                <Router>
                    <UCSBOrganizationsForm />
                </Router>
            </QueryClientProvider>
        );
        expect(await screen.findByTestId(`${testId}-orgCode`)).toBeInTheDocument();
        expect(screen.getByText(`OrgCode`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-orgTranslationShort`)).toBeInTheDocument();
        expect(screen.getByText(`OrgTranslationShort`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-orgTranslation`)).toBeInTheDocument();
        expect(screen.getByText(`OrgTranslation`)).toBeInTheDocument();
        expect(await screen.findByTestId(`${testId}-inactive`)).toBeInTheDocument();
        expect(screen.getByText(`Inactive`)).toBeInTheDocument();


        expect(await screen.findByText(/Create/)).toBeInTheDocument();
        const submitButton = screen.getByText(/Create/);
        fireEvent.click(submitButton);

        await screen.findByText(/Short Organization Translation is required/);
        expect(screen.getByText(/Full Organization Translation is required/)).toBeInTheDocument();

        const nameInput = screen.getByTestId(`${testId}-orgTranslationShort`);
        fireEvent.change(nameInput, { target: { value: "a".repeat(101) } });
        fireEvent.click(submitButton);


        await waitFor(() => {
            expect(screen.getByText(/Max length 100 characters/)).toBeInTheDocument();
        });

    });

});