import React from 'react'
import { useBackend } from 'main/utils/useBackend';

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecRequestsTable from 'main/components/RecommendationRequest/RecRequestTable';
import { Button } from 'react-bootstrap';
import { useCurrentUser , hasRole} from 'main/utils/currentUser';

export default function RecRequestIndexPage() {

  const currentUser = useCurrentUser();

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
        return (
            <Button
                variant="primary"
                href="/recrequest/create"
                style={{ float: "right" }}
            >
                Create Recommendation Request 
            </Button>
        )
    } 
  }

  const { data: recRequests, error: _error, status: _status } =
    useBackend(
      // Stryker disable next-line all : don't test internal caching of React Query
      ["/api/recommendationRequest/all"],
      { method: "GET", url: "/api/recommendationRequest/all" },
      []
    );
  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Recommendation Requests</h1>
        <RecRequestsTable recrequests={recRequests} currentUser={currentUser} />
      </div>
    </BasicLayout>
  )
}