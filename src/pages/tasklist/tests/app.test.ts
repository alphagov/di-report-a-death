import { publicSectorPensionsStatus } from '../app';
import { describe, expect, it } from '@jest/globals';
import { BaseSession } from 'common/session';
import { OtherPensionProviderOptions } from 'common/answer';

const baseSession: BaseSession = {
    SessionId: 'a-a-a-a-a-a',
    UpdatedAt: 1,
    CreatedAt: 1,
};

describe('publicSectorPensionStatus', () => {
    it('returns Cannot start yet when no national insurance number is present', () => {
        expect(publicSectorPensionsStatus({ ...baseSession }).publicSectorPensionStatus).toEqual('cannot-start-yet');
    });

    it('returns Not started when national insurance number is present', () => {
        expect(
            publicSectorPensionsStatus({
                ...baseSession,
                'national-insurance-number-known': 'no',
            }).publicSectorPensionStatus,
        ).toEqual('not-started');
    });

    it('returns In progress when pension providers has been done', () => {
        expect(
            publicSectorPensionsStatus({
                ...baseSession,
                'national-insurance-number-known': 'no',
                'pensions-to-tell': ['croydon'],
            }).publicSectorPensionStatus,
        ).toEqual('in-progress');
    });

    it('returns Completed when pension providers and CSP been done', () => {
        expect(
            publicSectorPensionsStatus({
                ...baseSession,
                'national-insurance-number-known': 'yes',
                'national-insurance-number': '1',
                'pensions-to-tell': ['croydon'],
                'other-pension-providers': [OtherPensionProviderOptions.civil],
            }).publicSectorPensionStatus,
        ).toEqual('completed');
    });
});
