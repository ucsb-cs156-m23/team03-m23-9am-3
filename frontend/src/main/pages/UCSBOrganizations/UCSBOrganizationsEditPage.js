import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import {Navigate, useParams} from "react-router-dom";
import {useBackend, useBackendMutation} from "../../utils/useBackend";
import {toast} from "react-toastify";
import UCSBOrganizationsForm from 'main/components/UCSBOrganizations/UCSBOrganizationsForm';

export default function UCSBOrganizationsEditPage({storybook=false}) {
    let { orgCode } = useParams();

    const { data: organization, _error, _status } =
        useBackend(
            // Stryker disable next-line all : don't test internal caching of React Query
            [`/api/ucsborganizations?orgCode=${orgCode}`],
            {  // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
                method: "GET",
                url: `/api/ucsborganizations`,
                params: {
                    orgCode
                }
            }
        );

    const objectToAxiosPutParams = (organization) => ({
        url: "/api/ucsborganizations",
        method: "PUT",
        params: {
            orgCode: organization.orgCode
        },
        data: {
            orgTranslationShort: organization.orgTranslationShort,
            orgTranslation: organization.orgTranslation,
            inactive: organization.inactive,
        }
    });

    const onSuccess = (organization) => {
        toast(`UCSB Organization Updated - orgCode: ${organization.orgCode}`);
    }

    const mutation = useBackendMutation(
        objectToAxiosPutParams,
        { onSuccess },
        // Stryker disable next-line all : hard to set up test for caching
        [`/api/ucsborganizations?orgCode=${orgCode}`]
    );

    const { isSuccess } = mutation

    const onSubmit = async (data) => {
        mutation.mutate(data);
    }

    if (isSuccess && !storybook) {
        return <Navigate to="/ucsborganizations" />
    }

    return (
        <BasicLayout>
            <div className="pt-2">
                <h1>Edit UCSB Organization</h1>
                {
                    organization && <UCSBOrganizationsForm submitAction={onSubmit} buttonLabel={"Update"} initialContents={organization} orgCodeDisabled />
                }
            </div>
        </BasicLayout>
    )
}