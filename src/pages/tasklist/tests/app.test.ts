import { publicSectorPensionsStatus } from '../app';
import { expect, describe, it } from '@jest/globals';
import { BaseSession } from 'common/session';

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
                'pension-providers': 'croydon',
            }).publicSectorPensionStatus,
        ).toEqual('in-progress');
    });

    it('returns Completed when pension providers and CSP been done', () => {
        expect(
            publicSectorPensionsStatus({
                ...baseSession,
                'national-insurance-number-known': 'yes',
                'national-insurance-number': '1',
                'pension-providers': 'croydon',
                'other-pension-providers': ['civil'],
            }).publicSectorPensionStatus,
        ).toEqual('completed');
    });
});
