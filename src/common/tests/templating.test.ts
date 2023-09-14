import { formatNationalInsuranceNumber } from '../templating';

describe('formatNationalInsuranceNumber', () => {
    it('formats 9 character national insurance number correctly', () => {
        expect(formatNationalInsuranceNumber('AA123456A')).toEqual('AA 12 34 56 A');
    });
    it('formats 8 character national insurance number correctly', () => {
        expect(formatNationalInsuranceNumber('AA123456')).toEqual('AA 12 34 56');
    });
    it('returns undefined when the national insurance number is undefined', () => {
        expect(formatNationalInsuranceNumber(undefined)).toBeUndefined();
    });
});
