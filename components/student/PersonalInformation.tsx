'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { useNextStepPath, useStepBadge } from '@/lib/forms/use-profile-steps';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { classNames } from '@/lib/cx';
import type { CountryInfo } from '@/lib/options/geo';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useFormSection, validateField } from '@/lib/forms/use-form-schema';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/PersonalInformation.module.css';
import { SchemaFields } from './SchemaFields';

const cx = classNames(styles);

export function PersonalInformation() {
  const profile = useStudentProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToReview = searchParams.get('from') === 'review';
  /** Numbered against the steps this student actually has. */
  const stepBadge = useStepBadge('personal-information');
  /** Continue follows the published order, not a name typed in here. */
  const nextStep = useNextStepPath('personal-information');

  const [countries, setCountries] = useState<CountryInfo[]>([]);
  const [countryCityOptions, setCountryCityOptions] = useState<Record<string, string[]>>({});
  const [countryOpen, setCountryOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const [form, setForm] = useState<Record<string, string>>({ mobileCountry: 'IN', altMobileCountry: 'IN' });
  const seeded = useRef(false);

  /**
   * The fields this step draws by hand, so the schema renderer only adds what an
   * admin has introduced rather than duplicating them.
   */
  const CODED_KEYS = [
    'fullName', 'email', 'mobileCountry', 'mobileNumber',
    'altMobileCountry', 'altMobileNumber', 'country', 'city', 'phone', 'location'
  ];

  /** What the published form says about the fields drawn by hand above. */
  const fields = useSectionFields('personalInformation', CODED_KEYS);

  const { fields: schemaFields } = useFormSection('personalInformation');
  const extraFields = schemaFields.filter(field => !CODED_KEYS.includes(field.key) && !field.composite);
  const [extraValues, setExtraValues] = useState<Record<string, unknown>>({});
  const [extraTouched, setExtraTouched] = useState<Record<string, boolean>>({});

  const value = (key: string) => form[key] || '';
  const setValue = (key: string, next: string) => setForm(current => ({ ...current, [key]: next }));

  /** Seed the form once from whatever the server already holds for this section. */
  useEffect(() => {
    if (seeded.current || !profile.loaded) return;
    seeded.current = true;
    setForm(current => ({ ...current, ...profile.profile.personal }));
    /** Admin-added fields live in the same section, so they seed from it too. */
    setExtraValues(current => ({ ...profile.profile.personal, ...current }));
  }, [profile.loaded, profile.profile.personal]);

  const handleUnauthorized = () => {
    clearAccessToken();
    router.push('/auth/login/student?sessionExpired=1');
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = readAccessToken();
      if (!token) {
        router.push('/auth/login/student');
        return;
      }
      try {
        const geo = await authApi.getGeoReferenceData();
        if (cancelled) return;
        setCountries(geo.countries);
        setCountryCityOptions({ India: geo.indiaCities });
      } catch {
        // Reference data endpoint unreachable — dropdowns stay empty; the student can still type a country/city.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markTouched = (key: string) => setTouched(current => ({ ...current, [key]: true }));

  const fullNameError = value('fullName').trim().length >= 2 ? '' : 'Enter your full name';

  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value('email').trim()) ? '' : 'Enter a valid email address';

  const mobileError = (() => {
    if (!value('mobileCountry')) return 'Select a country code';
    const digits = value('mobileNumber').replace(/\D/g, '');
    return /^\d{6,14}$/.test(digits) ? '' : 'Enter a valid mobile number';
  })();

  /** Dial country plus digits, so spacing never decides whether two match. */
  const mobileKeyOf = (country: string, number: string) => {
    const digits = number.replace(/\D/g, '');
    return digits ? `${country.trim().toUpperCase()}:${digits}` : '';
  };

  const altMobileError = (() => {
    const raw = value('altMobileNumber').trim();
    if (!raw) return '';
    if (!value('altMobileCountry')) return 'Select a country code';
    const digits = raw.replace(/\D/g, '');
    if (!/^\d{6,14}$/.test(digits)) return 'Enter a valid mobile number';
    /** The server refuses this too; catching it here saves a round trip. */
    const primary = mobileKeyOf(value('mobileCountry'), value('mobileNumber'));
    const alternate = mobileKeyOf(value('altMobileCountry'), raw);
    return primary && primary === alternate
      ? 'Use a different number from your mobile number'
      : '';
  })();

  const countryValid = countries.some(c => c.name === value('country'));
  const countryError = countryValid ? '' : 'Select a valid country from the list';

  const cityOptions = countryCityOptions[value('country')] || [];
  const hasCityOptions = cityOptions.length > 0;
  const cityError = value('city').trim() ? '' : 'Select or enter your current city';

  /** The published field each hand-drawn control saves into. */
  const SCHEMA_KEY: Record<string, string> = {
    fullName: 'fullName',
    email: 'email',
    mobile: 'mobileNumber',
    altMobile: 'altMobileNumber',
    country: 'country',
    city: 'city'
  };

  const errorFor = (key: string): string => {
    /** A field the admin has hidden cannot be wrong, and must not block the step. */
    if (SCHEMA_KEY[key] && !fields.shows(SCHEMA_KEY[key])) return '';

    switch (key) {
      case 'fullName': return fullNameError;
      case 'email': return emailError;
      case 'mobile': return mobileError;
      case 'altMobile': return altMobileError;
      case 'country': return countryError;
      case 'city': return cityError;
      default: return '';
    }
  };

  const showError = (key: string) => (touched[key] || submitted) && !!errorFor(key);

  const filteredCountries = (() => {
    const query = value('country').trim().toLowerCase();
    return !query ? countries : countries.filter(c => c.name.toLowerCase().includes(query));
  })();

  const selectCountry = (country: CountryInfo) => {
    const changed = value('country') !== country.name;
    setValue('country', country.name);
    setCountryOpen(false);
    if (changed) setValue('city', '');
  };

  const isValid = !Object.keys(SCHEMA_KEY).some(key => errorFor(key));

  const dialFor = (iso2: string) => countries.find(c => c.iso2 === iso2)?.dial || '';

  /** The same rules the server will apply, so problems surface before the round trip. */
  const extraErrors = Object.fromEntries(
    extraFields.map(field => [field.key, validateField(field, extraValues[field.key])])
  );
  const extraValid = Object.values(extraErrors).every(message => !message);

  const saveAndContinue = async () => {
    setSubmitted(true);
    setSaveError('');
    /** Touch every added field so its error is visible rather than silent. */
    setExtraTouched(Object.fromEntries(extraFields.map(field => [field.key, true])));
    if (!isValid || !extraValid) return;

    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    const mobile = `${dialFor(value('mobileCountry'))} ${value('mobileNumber')}`.trim();

    const payload = {
      ...extraValues,
      fullName: value('fullName'),
      email: value('email'),
      mobileCountry: value('mobileCountry'),
      mobileNumber: value('mobileNumber'),
      altMobileCountry: value('altMobileCountry') || undefined,
      altMobileNumber: value('altMobileNumber') || undefined,
      country: value('country'),
      city: value('city'),
      phone: mobile,
      location: [value('city'), value('country')].filter(Boolean).join(', ')
    };

    setSaving(true);
    try {
      await authApi.saveStudentPersonalInformation(token, payload);
      await profile.refresh();
      router.push(returnToReview ? '/student/review' : nextStep());
    } catch (e) {
      if ((e as ApiError).status === 401) {
        handleUnauthorized();
        return;
      }
      setSaveError(e instanceof Error ? e.message : 'Could not save your details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const dialOptions = countries.map(c => (
    <option key={c.iso2} value={c.iso2} title={c.name}>{c.dial}</option>
  ));

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
        <div className={cx('profile-form-card')}>
          <div className={cx('card-head')}>
            <div className={cx('placeholder-copy')}>
              <div>
                <h2>{fields.title || 'Personal Information'} details</h2>
                <p>{fields.description || 'Your information is securely saved to your student profile.'}</p>
              </div>
            </div>
            <span className={cx('step-badge')}>{stepBadge}</span>
          </div>

          <div className={cx('field-grid')}>
            {!!extraFields.length && (
              <SchemaFields
                fields={extraFields}
                values={extraValues}
                errors={extraErrors}
                touched={extraTouched}
                cx={cx}
                onChange={(key, value) => setExtraValues(current => ({ ...current, [key]: value }))}
                onBlur={key => setExtraTouched(current => ({ ...current, [key]: true }))}
              />
            )}

            {fields.shows('fullName') && (
              <label className={cx(showError('fullName') && 'field-invalid')}>
                <span className={cx('field-label')}>{fields.labelOf('fullName', 'Full Name')}{fields.isRequired('fullName', true) && <span className={cx('required-mark')}> *</span>}</span>
                <input
                  type="text" name="fullName" autoComplete="name" placeholder="Aarav Mehta"
                  value={value('fullName')}
                  onChange={e => setValue('fullName', e.target.value)}
                  onBlur={() => markTouched('fullName')}
                />
                {showError('fullName') && <small className={cx('field-error')}>{fullNameError}</small>}
              </label>
            )}

            {fields.shows('email') && (
              <label className={cx(showError('email') && 'field-invalid')}>
                <span className={cx('field-label')}>{fields.labelOf('email', 'Email Address')}{fields.isRequired('email', true) && <span className={cx('required-mark')}> *</span>}</span>
                <input
                  type="email" name="email" autoComplete="email" placeholder="aarav@example.com"
                  value={value('email')}
                  onChange={e => setValue('email', e.target.value)}
                  onBlur={() => markTouched('email')}
                />
                {showError('email') && <small className={cx('field-error')}>{emailError}</small>}
              </label>
            )}

            <div className={cx('field-pair-row')}>
              {fields.shows('mobileNumber') && (
                <label className={cx(showError('mobile') && 'field-invalid')}>
                  <span className={cx('field-label')}>{fields.labelOf('mobileNumber', 'Mobile Number')}{fields.isRequired('mobileNumber', true) && <span className={cx('required-mark')}> *</span>}</span>
                  <div className={cx('phone-group')}>
                    <select
                      className={cx('dial-select')} name="mobileCountry"
                      value={value('mobileCountry')}
                      onChange={e => { setValue('mobileCountry', e.target.value); markTouched('mobile'); }}
                      onBlur={() => markTouched('mobile')}
                    >
                      <option value="" disabled>+</option>
                      {dialOptions}
                    </select>
                    <input
                      type="tel" name="mobileNumber" autoComplete="tel-national" placeholder="98765 43210"
                      value={value('mobileNumber')}
                      onChange={e => setValue('mobileNumber', e.target.value)}
                      onBlur={() => markTouched('mobile')}
                    />
                  </div>
                  {showError('mobile')
                    ? <small className={cx('field-error')}>{mobileError}</small>
                    : <small className={cx('field-hint')}>&nbsp;</small>}
                </label>
              )}

              {fields.shows('altMobileNumber') && (
                <label className={cx(showError('altMobile') && 'field-invalid')}>
                  <span className={cx('field-label')}>{fields.labelOf('altMobileNumber', 'Additional Mobile Number')}{fields.isRequired('altMobileNumber', false) && <span className={cx('required-mark')}> *</span>}</span>
                  <div className={cx('phone-group')}>
                    <select
                      className={cx('dial-select')} name="altMobileCountry"
                      value={value('altMobileCountry')}
                      onChange={e => { setValue('altMobileCountry', e.target.value); markTouched('altMobile'); }}
                      onBlur={() => markTouched('altMobile')}
                    >
                      <option value="" disabled>+</option>
                      {dialOptions}
                    </select>
                    <input
                      type="tel" name="altMobileNumber" autoComplete="tel-national" placeholder="Optional"
                      value={value('altMobileNumber')}
                      onChange={e => setValue('altMobileNumber', e.target.value)}
                      onBlur={() => markTouched('altMobile')}
                    />
                  </div>
                  {showError('altMobile')
                    ? <small className={cx('field-error')}>{altMobileError}</small>
                    : <small className={cx('field-hint')}>&nbsp;</small>}
                </label>
              )}
            </div>

            <div className={cx('field-pair-row')}>
              {fields.shows('country') && (
                <label className={cx('combo-field', showError('country') && 'field-invalid')}>
                  <span className={cx('field-label')}>{fields.labelOf('country', 'Country')}{fields.isRequired('country', true) && <span className={cx('required-mark')}> *</span>}</span>
                  <input
                    type="text" name="country" autoComplete="country-name" placeholder="Search for your country"
                    value={value('country')}
                    onFocus={() => setCountryOpen(true)}
                    onChange={e => { setValue('country', e.target.value); setCountryOpen(true); }}
                    onBlur={() => setTimeout(() => setCountryOpen(false), 150)}
                  />
                  {countryOpen && (
                    <ul className={cx('combo-list')}>
                      {filteredCountries.map(c => (
                        <li key={c.iso2} onMouseDown={() => selectCountry(c)}>{c.name}</li>
                      ))}
                      {!filteredCountries.length && <li className={cx('combo-empty')}>No matching country</li>}
                    </ul>
                  )}
                  {showError('country') && <small className={cx('field-error')}>{countryError}</small>}
                </label>
              )}

              {fields.shows('city') && (
                <label className={cx(showError('city') && 'field-invalid')}>
                  <span className={cx('field-label')}>{fields.labelOf('city', 'Current City')}{fields.isRequired('city', true) && <span className={cx('required-mark')}> *</span>}</span>
                  {hasCityOptions ? (
                    <select
                      name="city"
                      value={value('city')}
                      onChange={e => { setValue('city', e.target.value); markTouched('city'); }}
                      onBlur={() => markTouched('city')}
                    >
                      <option value="" disabled>Select city</option>
                      {cityOptions.map(city => <option key={city} value={city}>{city}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text" name="city" placeholder="Enter your current city"
                      value={value('city')}
                      disabled={!countryValid}
                      onChange={e => setValue('city', e.target.value)}
                      onBlur={() => markTouched('city')}
                    />
                  )}
                  {!countryValid && <small className={cx('field-hint')}>Select a valid country first</small>}
                  {countryValid && !hasCityOptions && (
                    <small className={cx('field-hint')}>City list not available for this country — type your city</small>
                  )}
                  {showError('city') && <small className={cx('field-error')}>{cityError}</small>}
                </label>
              )}
            </div>
          </div>

          {submitted && !isValid && (
            <p className={cx('save-message', 'error')}>Please fix the highlighted fields before continuing.</p>
          )}
          {saveError && <p className={cx('save-message', 'error')}>{saveError}</p>}
        </div>

        <div className={cx('step-actions')}>
          <span></span>
          <button className={cx('button', 'primary')} type="button" disabled={saving} onClick={saveAndContinue}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  );
}
