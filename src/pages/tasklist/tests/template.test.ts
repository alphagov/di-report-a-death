import { describe, expect, it } from '@jest/globals';
import { BaseSession } from 'common/session';
import { renderAsHtmlResponse } from 'common/templating';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { JSDOM } from 'jsdom';

const baseSession: BaseSession = {
    SessionId: 'a-a-a-a-a-a',
    UpdatedAt: 1,
    CreatedAt: 1,
};
const event: APIGatewayProxyEvent = {} as never as APIGatewayProxyEvent;

describe('tasklist template', () => {
    it('renders the correct tag when public sector pension status is completed', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'completed' });
        expectPublicSectorPensionTagToBe(result, 'Completed');
    });
    it('renders the correct tag when public sector pension status is not started', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'not-started' });
        expectPublicSectorPensionTagToBe(result, 'Not started');
    });
    it('renders the correct tag when public sector pension status is cannot start yet', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'cannot-start-yet' });
        expectPublicSectorPensionTagToBe(result, 'Cannot start yet');
    });
    it('renders the correct tag when public sector pension status is in progress', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'in-progress' });
        expectPublicSectorPensionTagToBe(result, 'In progress');
    });
    it('does not show the public sector pensions link when the status is cannot start yet', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'cannot-start-yet' });
        expect(result.body.innerHTML).not.toContain('/public-sector-pensions');
    });
    it('shows the public sector pensions link when the status is completed', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'completed' });
        expect(result.body.innerHTML).toContain('/public-sector-pensions');
    });
    it('shows the public sector pensions link when the status is in progress', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'in-progress' });
        expect(result.body.innerHTML).toContain('/public-sector-pensions');
    });
    it('shows the public sector pensions link when the status is not started', () => {
        const result = renderTemplate({ publicSectorPensionStatus: 'not-started' });
        expect(result.body.innerHTML).toContain('/public-sector-pensions');
    });
});

const renderTemplate = (templateVarOverrides: object): Document => {
    const response = renderAsHtmlResponse(event, 'template.njk', {
        baseSession,
        ...templateVarOverrides,
    });
    return new JSDOM(response.body).window.document;
};

const expectPublicSectorPensionTagToBe = (document: Document, expected: string) => {
    expect(document.getElementById('public-sector-pensions-status')?.innerHTML?.trim()).toEqual(expected);
};
