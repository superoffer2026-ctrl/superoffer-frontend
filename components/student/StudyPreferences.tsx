'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useSchemaExtras } from '@/lib/forms/use-schema-extras';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/StudyPreferences.module.css';
import { SchemaFields } from './SchemaFields';
import { useNextStepPath, useStepBadge } from '@/lib/forms/use-profile-steps';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { MultiComboField } from './MultiComboField';

const cx = classNames(styles);

type MultiKey = 'countries' | 'fieldsOfStudy' | 'programs' | 'startYear' | 'intakes';
type Which = 'country' | 'field' | 'program' | 'intake' | 'year';

type Selections = Record<MultiKey, string[]>;

/** The keys this step draws itself; anything else published is an addition. */
const CODED_KEYS = ['countries', 'studyLevel', 'fieldOfInterest', 'startYear', 'intake'];

const EMPTY: Selections = { countries: [], fieldsOfStudy: [], programs: [], startYear: [], intakes: [] };

/** Which published field each selection on this page saves into. */
const SCHEMA_KEY: Record<MultiKey, string> = {
  countries: 'countries',
  fieldsOfStudy: 'studyLevel',
  programs: 'fieldOfInterest',
  startYear: 'startYear',
  intakes: 'intake'
};

const QUERY_KEY: Record<MultiKey, Which> = {
  countries: 'country',
  fieldsOfStudy: 'field',
  programs: 'program',
  startYear: 'year',
  intakes: 'intake'
};

export function StudyPreferences() {
  const profile = useStudentProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnToReview = searchParams.get('from') === 'review';
  /** Numbered against the steps this student actually has. */
  const stepBadge = useStepBadge('study-preferences');
  /** Continue follows the published order, not a name typed in here. */
  const nextStep = useNextStepPath('study-preferences');

  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [mbbsOnlyCountries, setMbbsOnlyCountries] = useState<string[]>([]);
  /** "What do you want to study?" — MBBS-only for MBBS-only countries, the full degree-level list otherwise. */
  const [fieldOptions, setFieldOptions] = useState<string[]>([]);
  /** "Program of Interest" — always the full subject list. */
  const [programOptions, setProgramOptions] = useState<string[]>([]);
  const [intakeOptions, setIntakeOptions] = useState<string[]>([]);
  const [startYearOptions, setStartYearOptions] = useState<number[]>([]);

  const [selections, setSelections] = useState<Selections>(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [queries, setQueries] = useState<Record<Which, string>>({ country: '', field: '', program: '', intake: '', year: '' });
  const [openField, setOpenField] = useState<Which | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const seeded = useRef(false);

  /** Fields this step draws by hand; anything else the schema declares is added below. */
  /** What the published form says about the fields this step draws by hand. */
  const fields = useSectionFields('studyPreferences', CODED_KEYS);

  const extras = useSchemaExtras(
    'studyPreferences',
    CODED_KEYS,
    profile.profile.studyPreferences,
    profile.loaded
  );


  const handleUnauthorized = () => {
    clearAccessToken();
    router.push('/auth/login/student?sessionExpired=1');
  };

  /** Seed once from the section the server already holds. */
  useEffect(() => {
    if (seeded.current || !profile.loaded) return;
    seeded.current = true;
    const saved = profile.profile.studyPreferences || {};
    setSelections({
      countries: saved['countries'] || [],
      fieldsOfStudy: saved['studyLevel'] || [],
      programs: saved['fieldOfInterest'] || [],
      startYear: saved['startYear'] || [],
      intakes: saved['intake'] || []
    });
  }, [profile.loaded, profile.profile.studyPreferences]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = readAccessToken();
      if (!token) {
        router.push('/auth/login/student');
        return;
      }
      try {
        const options = await authApi.getStudyPreferencesReferenceData();
        if (cancelled) return;
        setCountryOptions(options.studyCountries);
        setMbbsOnlyCountries(options.mbbsOnlyCountries);
        setFieldOptions(options.studyLevels);
        setProgramOptions(options.fieldsOfStudy);
        setIntakeOptions(options.intakeOptions);
        setStartYearOptions(options.startYears.map(Number));
      } catch {
        // Reference data endpoint unreachable — dropdowns stay empty; existing selections still load below.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** True once one of the selected countries only offers an MBBS pathway. */
  const isMbbsOnlyCountrySelected = (countries = selections.countries) =>
    countries.some(country => mbbsOnlyCountries.includes(country));

  /** "What do you want to study?" narrows to MBBS only once an MBBS-only country is picked. */
  const availableFieldOptions = (countries = selections.countries) =>
    isMbbsOnlyCountrySelected(countries) ? ['MBBS'] : fieldOptions;

  /** Every combo field allows multiple selections; dropdown stays open so more picks can follow. */
  const toggleMulti = (key: MultiKey, value: string) => {
    setSelections(current => {
      const list = current[key];
      const nextList = list.includes(value) ? list.filter(item => item !== value) : [...list, value];
      const next: Selections = { ...current, [key]: nextList };

      /** Drops study levels no longer offered, and auto-fills MBBS once an MBBS-only country is picked. */
      if (key === 'countries') {
        const allowed = availableFieldOptions(nextList);
        let fields = next.fieldsOfStudy.filter(item => allowed.includes(item));
        if (isMbbsOnlyCountrySelected(nextList) && !fields.includes('MBBS')) fields = [...fields, 'MBBS'];
        next.fieldsOfStudy = fields;
      }
      return next;
    });
    setTouched(current => ({ ...current, [key]: true }));
    /** Clears the search text so the box falls back to showing the (now updated) selection. */
    setQueries(current => ({ ...current, [QUERY_KEY[key]]: '' }));
  };

  const filterOptions = (options: string[], query: string): string[] => {
    const q = query.trim().toLowerCase();
    return !q ? options : options.filter(option => option.toLowerCase().includes(q));
  };

  const filterYearOptions = (query: string): string[] => {
    const q = query.trim();
    const years = startYearOptions.map(String);
    return !q ? years : years.filter(year => year.includes(q));
  };

  const openFor = (which: Which) => () => {
    setOpenField(which);
    setQueries(current => ({ ...current, [which]: '' }));
  };

  /** Closes the dropdown when focus genuinely leaves the field (option clicks don't blur it). */
  const closeFor = (which: Which) => () => setOpenField(current => (current === which ? null : current));

  const queryFor = (which: Which) => (value: string) => setQueries(current => ({ ...current, [which]: value }));

  /**
   * A field the admin has hidden or made optional cannot block the step. Only
   * what the published form still asks for is enforced here.
   */
  const invalid = (key: MultiKey) => {
    const published = SCHEMA_KEY[key];
    if (!fields.shows(published)) return false;
    if (!fields.isRequired(published, true)) return false;
    return !selections[key].length;
  };
  const showError = (key: MultiKey) => (touched[key] || submitted) && invalid(key);
  const formInvalid = (Object.keys(EMPTY) as MultiKey[]).some(invalid);

  const saveAndContinue = async () => {
    setSubmitted(true);
    extras.touchAll();
    setSaveError('');
    if (formInvalid) return;

    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    const payload = {
      ...extras.values0,
      countries: selections.countries,
      studyLevel: selections.fieldsOfStudy,
      fieldOfInterest: selections.programs,
      startYear: selections.startYear,
      intake: selections.intakes
    };

    setSaving(true);
    try {
      await authApi.saveStudentStudyPreferences(token, payload);
      await profile.refresh();
      router.push(returnToReview ? '/student/review' : nextStep());
    } catch (e) {
      if ((e as ApiError).status === 401) {
        handleUnauthorized();
        return;
      }
      setSaveError(e instanceof Error ? e.message : 'Could not save your preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const required = <span className={cx('required-mark')}>*</span>;

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
        <form className={cx('profile-form-card')} onSubmit={event => { event.preventDefault(); void saveAndContinue(); }}>
          <div className={cx('card-head')}>
            <div className={cx('placeholder-copy')}>
              <div>
                <h2>Study Preferences details</h2>
                <p>Your information is securely saved to your student profile.</p>
              </div>
            </div>
            <span className={cx('step-badge')}>{stepBadge}</span>
          </div>

          <div className={cx('field-grid')}>
            {!!extras.fields.length && (
              <SchemaFields
                fields={extras.fields}
                values={extras.values}
                errors={extras.errors}
                touched={extras.touched}
                cx={cx}
                onChange={extras.setValue}
                onBlur={extras.setTouched}
              />
            )}


            {fields.shows('countries') && (
            <MultiComboField
              label={<>{fields.labelOf('countries', 'Which country do you want to study in?')}{fields.isRequired('countries', true) ? required : null}</>}
              placeholder="Search countries"
              toggleLabel="Toggle country list"
              emptyText="No matching country"
              options={filterOptions(countryOptions, queries.country)}
              selected={selections.countries}
              open={openField === 'country'}
              query={queries.country}
              invalid={showError('countries')}
              error="Select at least one country"
              onOpen={openFor('country')}
              onClose={closeFor('country')}
              onQueryChange={queryFor('country')}
              onToggleOption={value => toggleMulti('countries', value)}
            />
            )}

            {fields.shows('studyLevel') && (
            <MultiComboField
              label={<>{fields.labelOf('studyLevel', 'What do you want to study?')}{fields.isRequired('studyLevel', true) ? required : null}</>}
              placeholder="Search"
              toggleLabel="Toggle list"
              emptyText="No matching option"
              options={filterOptions(availableFieldOptions(), queries.field)}
              selected={selections.fieldsOfStudy}
              open={openField === 'field'}
              query={queries.field}
              invalid={showError('fieldsOfStudy')}
              error="Select at least one option"
              hint={
                isMbbsOnlyCountrySelected() ? (
                  <small className={cx('field-hint')}>One of your selected countries only offers MBBS.</small>
                ) : undefined
              }
              onOpen={openFor('field')}
              onClose={closeFor('field')}
              onQueryChange={queryFor('field')}
              onToggleOption={value => toggleMulti('fieldsOfStudy', value)}
            />
            )}

            {fields.shows('fieldOfInterest') && (
            <MultiComboField
              label={<>{fields.labelOf('fieldOfInterest', 'Program of Interest')}{fields.isRequired('fieldOfInterest', true) ? required : null}</>}
              placeholder="Search programs"
              toggleLabel="Toggle program list"
              emptyText="No matching program"
              options={filterOptions(programOptions, queries.program)}
              selected={selections.programs}
              open={openField === 'program'}
              query={queries.program}
              invalid={showError('programs')}
              error="Select at least one program"
              onOpen={openFor('program')}
              onClose={closeFor('program')}
              onQueryChange={queryFor('program')}
              onToggleOption={value => toggleMulti('programs', value)}
            />
            )}

            {fields.shows('startYear') && (
            <MultiComboField
              label={<>{fields.labelOf('startYear', 'When do you plan to start studying?')}{fields.isRequired('startYear', true) ? required : null}</>}
              placeholder="Search year"
              toggleLabel="Toggle year list"
              emptyText="No matching year"
              options={filterYearOptions(queries.year)}
              selected={selections.startYear}
              open={openField === 'year'}
              query={queries.year}
              invalid={showError('startYear')}
              error="Select at least one start year"
              onOpen={openFor('year')}
              onClose={closeFor('year')}
              onQueryChange={queryFor('year')}
              onToggleOption={value => toggleMulti('startYear', value)}
            />
            )}

            {fields.shows('intake') && (
            <MultiComboField
              label={<>{fields.labelOf('intake', 'Preferred Intake')}{fields.isRequired('intake', true) ? required : null}</>}
              placeholder="Search intake"
              toggleLabel="Toggle intake list"
              emptyText="No matching intake"
              options={filterOptions(intakeOptions, queries.intake)}
              selected={selections.intakes}
              open={openField === 'intake'}
              query={queries.intake}
              invalid={showError('intakes')}
              error="Select at least one intake"
              onOpen={openFor('intake')}
              onClose={closeFor('intake')}
              onQueryChange={queryFor('intake')}
              onToggleOption={value => toggleMulti('intakes', value)}
            />
            )}
          </div>

          {submitted && formInvalid && (
            <p className={cx('save-message', 'error')}>Please fix the highlighted fields before continuing.</p>
          )}
          {saveError && <p className={cx('save-message', 'error')}>{saveError}</p>}
        </form>

        <div className={cx('step-actions')}>
          <Link className={cx('button', 'secondary')} href="/student/personal-information">Previous</Link>
          <button className={cx('button', 'primary')} type="button" disabled={saving} onClick={saveAndContinue}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  );
}
