import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom';

function UCSBOrganizationsForm({ initialContents, submitAction, buttonlabel = "Create" }) {


    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm(
        { defaultValues: initialContents || {}, }
    );

    // Stryker restore all

    const navigate = useNavigate();

    const testIdPrefix = "UCSBOrganizationsForm";

    return (
        <Form onSubmit={handleSubmit(submitAction)}>

            {initialContents && (
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="orgCode">orgCode</Form.Label>
                    <Form.Control
                        data-testid={testIdPrefix + "-orgCode"}
                        id="orgCode"
                        type="text"
                        {...register("orgCode")}
                        value={initialContents.id}
                        disabled
                    />
                </Form.Group>
            )}

            <Form.Group className="mb-3">
                <Form.Label htmlFor="orgTranslationShort">OrgTranslationShort</Form.Label>
                <Form.Control
                    data-testid={testIdPrefix + "-orgTranslationShort"}
                    id="orgTranslationShort"
                    type="text"
                    isInvalid={Boolean(errors.orgTranslationShort)}
                    {...register("orgTranslationShort", {
                        required: "Short Organization Translation is required"
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.orgTranslationShort?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="orgTranslation">OrgTranslation</Form.Label>
                <Form.Control
                    data-testid={testIdPrefix + "-orgTranslation"}
                    id="orgTranslation"
                    type="text"
                    isInvalid={Boolean(errors.orgTranslation)}
                    {...register("orgTranslation", {
                        required: "Full Organization Translation is required"
                    })}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.orgTranslation?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label htmlFor="inactive">Inactive</Form.Label>
                <Form.Control
                    data-testid={testIdPrefix + "-inactive"}
                    id="inactive"
                    type="checkbox"
                    isInvalid={Boolean(errors.inactive)}
                      {...register("inactive", {
                        required: "Inactive status is required"
                      })}
                      />
                      <option value="true">true</option>
                      <option value="false">false</option>
                <Form.Control.Feedback type="invalid">
                    {errors.inactive?.message}
                </Form.Control.Feedback>
            </Form.Group>

            <Button
                type="submit"
                data-testid={testIdPrefix + "-submit"}
            >
                {buttonlabel}
            </Button>
            <Button
                variant="Secondary"
                onClick={() => navigate(-1)}
                data-testid={testIdPrefix + "-cancel"}
            >
                Cancel
            </Button>

        </Form> 
    )
}

export default UCSBOrganizationsForm;