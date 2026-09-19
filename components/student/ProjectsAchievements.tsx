'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authApi, type ApiError } from '@/lib/api/auth-api';
import { classNames } from '@/lib/cx';
import { clearAccessToken, readAccessToken } from '@/lib/storage';
import { useCompositeRows } from '@/lib/forms/use-composite-rows';
import { useStepBadge } from '@/lib/forms/use-profile-steps';
import { useSectionFields } from '@/lib/forms/use-section-fields';
import { useSchemaExtras } from '@/lib/forms/use-schema-extras';
import { useStudentProfile } from '@/lib/stores/student-profile.store';
import styles from '@/styles/ProjectsAchievements.module.css';
import { SchemaFields } from './SchemaFields';

const cx = classNames(styles);

interface Project {
  title: string;
  role: string;
  description: string;
}

const emptyProject = (entry?: Record<string, string>): Project => ({
  title: entry?.['title'] || '',
  role: entry?.['role'] || '',
  description: entry?.['description'] || ''
});

const linkLabel = (url: string): string => {
  if (/github\.com/i.test(url)) return 'GitHub';
  if (/linkedin\.com/i.test(url)) return 'LinkedIn';
  return 'Link';
};

export function ProjectsAchievements() {
  const profile = useStudentProfile();
  const router = useRouter();
  /** Numbered against the steps this student actually has. */
  const stepBadge = useStepBadge('projects');

  const [achievementSuggestions, setAchievementSuggestions] = useState<string[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [achievementDraft, setAchievementDraft] = useState('');
  const [linkDraft, setLinkDraft] = useState('');
  const [linkError, setLinkError] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  /** Fields this step draws by hand; anything else the schema declares is added below. */
  /** What each project row asks for, as published. */
  const rows = useCompositeRows('projectsAchievements', 'projects');

  /** The section's own headings and the fields it draws by hand. */
  const fields = useSectionFields('projectsAchievements', ['links', 'projects', 'achievements']);

  const extras = useSchemaExtras(
    'projectsAchievements',
    ['projects', 'achievements', 'links', 'githubLink', 'linkedinLink', 'projectTitle', 'projectRole'],
    profile.profile.projects,
    profile.loaded
  );


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
        const options = await authApi.getProjectsAchievementsReferenceData();
        if (cancelled) return;
        setAchievementSuggestions(options.achievementSuggestions);
      } catch {
        // Reference data endpoint unreachable — suggestion chips stay empty; free-text entry still works.
      }
      try {
        const profile = await authApi.studentProfile(token);
        if (cancelled) return;
        const data = (profile?.projects as Record<string, unknown>) || {};
        const savedProjects = (data['projects'] as Record<string, string>[]) || [];
        const savedAchievements = (data['achievements'] as string[]) || [];
        const savedLinks = (data['links'] as string[]) || [];
        if (savedProjects.length || savedAchievements.length || savedLinks.length) {
          setProjects(current => (current.length ? current : savedProjects.map(emptyProject)));
          setAchievements(current => (current.length ? current : savedAchievements));
          setLinks(current => (current.length ? current : savedLinks));
        }
      } catch (e) {
        if ((e as ApiError).status === 401) {
          handleUnauthorized();
          return;
        }
        // No saved projects yet, or the server is unreachable — the student can still fill the form from scratch.
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addProject = () => setProjects(current => [...current, emptyProject()]);
  const removeProject = (index: number) => setProjects(current => current.filter((_, i) => i !== index));
  const setProjectValue = (index: number, key: keyof Project, value: string) =>
    setProjects(current => current.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry)));

  const markGroupTouched = (index: number, key: string) =>
    setTouched(current => ({ ...current, [`project.${index}.${key}`]: true }));

  const showGroupError = (index: number, key: 'title' | 'role') =>
    (touched[`project.${index}.${key}`] || submitted) && !projects[index][key].trim();

  const unpickedSuggestions = () => achievementSuggestions.filter(item => !achievements.includes(item));

  const addAchievement = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    setAchievements(current => (current.includes(clean) ? current : [...current, clean]));
  };

  const addAchievementDraft = () => {
    addAchievement(achievementDraft);
    setAchievementDraft('');
  };

  const removeAchievement = (value: string) => setAchievements(current => current.filter(item => item !== value));

  const addLinkDraft = () => {
    const clean = linkDraft.trim();
    if (!clean) return;
    if (!/^https?:\/\/.+\..+/i.test(clean)) {
      setLinkError('Enter a valid link starting with http:// or https://');
      return;
    }
    setLinks(current => (current.includes(clean) ? current : [...current, clean]));
    setLinkDraft('');
    setLinkError('');
  };

  const removeLink = (url: string) => setLinks(current => current.filter(item => item !== url));

  /**
   * Which fields a project must carry comes from the published row definition, so
   * an admin making one optional actually makes it optional.
   */
  const projectErrors = (project: Project) => {
    const errors: Record<string, string> = {};
    for (const key of rows.missingIn(project as unknown as Record<string, unknown>)) {
      errors[key] = `${rows.all.find(field => field.key === key)?.label || key} is required`;
    }
    return errors;
  };

  const projectTouched = (index: number) => {
    const marks: Record<string, boolean> = {};
    for (const field of rows.all) marks[field.key] = touched[`project.${index}.${field.key}`] || submitted;
    return marks;
  };

  const isFormInvalid = (links.length === 0 && !linkDraft.trim()) || (achievements.length === 0 && !achievementDraft.trim()) || projects.some(
    project => !!rows.missingIn(project as unknown as Record<string, unknown>).length
  );
  const formInvalid = isFormInvalid; // keep the variable for the render block

  const saveAndContinue = async () => {
    setSubmitted(true);
    extras.touchAll();
    setSaveError('');
    setLinkError('');

    const finalLinks = [...links];
    let draftLinkError = '';
    const cleanLink = linkDraft.trim();
    if (cleanLink) {
      if (!/^https?:\/\/.+\..+/i.test(cleanLink)) {
        draftLinkError = 'Enter a valid link starting with http:// or https://';
      } else if (!finalLinks.includes(cleanLink)) {
        finalLinks.push(cleanLink);
      }
    }

    const finalAchievements = [...achievements];
    const cleanAchievement = achievementDraft.trim();
    if (cleanAchievement && !finalAchievements.includes(cleanAchievement)) {
      finalAchievements.push(cleanAchievement);
    }

    const actuallyInvalid = finalLinks.length === 0 || finalAchievements.length === 0 || projects.some(
      project => !!rows.missingIn(project as unknown as Record<string, unknown>).length
    );

    if (draftLinkError) {
      setLinkError(draftLinkError);
      return;
    }

    if (actuallyInvalid) return;
    
    // Update state so UI reflects the drafts becoming real tags
    if (cleanLink && !draftLinkError) {
      setLinks(finalLinks);
      setLinkDraft('');
    }
    if (cleanAchievement) {
      setAchievements(finalAchievements);
      setAchievementDraft('');
    }

    const token = readAccessToken();
    if (!token) {
      router.push('/auth/login/student');
      return;
    }

    const githubLink = finalLinks.find(link => linkLabel(link) === 'GitHub') || '';
    const linkedinLink = finalLinks.find(link => linkLabel(link) === 'LinkedIn') || '';
    const first = projects[0];
    const projectTitle = first ? first.title : '';
    const projectRole = first ? first.role : '';

    setSaving(true);
    try {
      await authApi.saveStudentProjectsAchievements(token, {
        ...extras.values0,
        projects,
        achievements: finalAchievements,
        links: finalLinks,
        githubLink,
        linkedinLink,
        projectTitle,
        projectRole
      });

      await profile.refresh();

      router.push('/student/review');
    } catch (e) {
      if ((e as ApiError).status === 401) {
        handleUnauthorized();
        return;
      }
      setSaveError(e instanceof Error ? e.message : 'Could not save your projects. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={cx('host')}>
      <section className={cx('step-page')}>
        <form className={cx('profile-form-card')} onSubmit={event => { event.preventDefault(); void saveAndContinue(); }}>
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


          <div className={cx('card-head')}>
            <div className={cx('placeholder-copy')}>
              <div>
                <h2>Projects &amp; Achievements details</h2>
                <p>Your information is securely saved to your student profile.</p>
              </div>
            </div>
            <span className={cx('step-badge')}>{stepBadge}</span>
          </div>

          <h3 className={cx('section-title')}>{fields.groupLabel('presence', 'Social Presence')}</h3>
          <p className={cx('section-hint')}>Share links to your GitHub, LinkedIn or portfolio.</p>

          <div className={cx('tag-input-row')}>
            <input
              type="text"
              placeholder="Paste a GitHub, LinkedIn or portfolio link"
              value={linkDraft}
              onChange={event => setLinkDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                addLinkDraft();
              }}
            />
            <button type="button" className={cx('tag-add-btn')} disabled={!linkDraft.trim()} onClick={addLinkDraft}>
              Add
            </button>
          </div>
          {linkError && <small className={cx('field-error')}>{linkError}</small>}
          {!!links.length && (
            <div className={cx('tag-chip-row')}>
              {links.map(link => (
                <span key={link} className={cx('tag-chip')}>
                  <span className={cx('tag-chip-text')}>{linkLabel(link)}: {link}</span>
                  <button type="button" onClick={() => removeLink(link)} aria-label={`Remove ${link}`}>×</button>
                </span>
              ))}
            </div>
          )}

          <h3 className={cx('section-title')}>{fields.groupLabel('projects', 'Projects')}</h3>
          <p className={cx('section-hint')}>Add any academic, personal or professional projects you&apos;re proud of.</p>

          {projects.map((project, index) => (
            <div key={index} className={cx('project-entry')}>
              <div className={cx('project-entry-head')}>
                <strong>Project {index + 1}</strong>
                <button type="button" className={cx('project-remove')} onClick={() => removeProject(index)} aria-label="Remove project">
                  ×
                </button>
              </div>
              {/* The row asks for whatever the published definition says it does. */}
              <div className={cx('field-grid')}>
                <SchemaFields
                  fields={rows.all}
                  values={project as unknown as Record<string, unknown>}
                  errors={projectErrors(project)}
                  touched={projectTouched(index)}
                  cx={cx}
                  onChange={(key, value) => setProjectValue(index, key as keyof Project, String(value ?? ''))}
                  onBlur={key => markGroupTouched(index, key)}
                />
              </div>
            </div>
          ))}

          <button type="button" className={cx('add-project-btn')} onClick={addProject}>
            + Add {projects.length ? 'another' : 'a'} project
          </button>

          <h3 className={cx('section-title')}>{fields.groupLabel('achievements', 'Achievements')}</h3>
          <p className={cx('section-hint')}>Optional. Awards, leadership, competitions or other recognition.</p>
          <div className={cx('tag-input-box')}>
            {achievements.map(item => (
              <span key={item} className={cx('tag-chip')}>
                {item}
                <button type="button" onClick={() => removeAchievement(item)} aria-label={`Remove ${item}`}>×</button>
              </span>
            ))}
            <input
              type="text"
              placeholder="e.g. Hackathon Winner"
              value={achievementDraft}
              onChange={event => setAchievementDraft(event.target.value)}
              onKeyDown={event => {
                if (event.key !== 'Enter') return;
                event.preventDefault();
                addAchievementDraft();
              }}
            />
          </div>
          <div className={cx('tag-suggestions')}>
            {unpickedSuggestions().map(suggestion => (
              <button key={suggestion} type="button" className={cx('tag-suggestion')} onClick={() => addAchievement(suggestion)}>
                + {suggestion}
              </button>
            ))}
          </div>
          {!achievements.length && (
            <p className={cx('tag-empty-hint')}>No achievements added yet — type your own or pick a suggestion above.</p>
          )}

          {submitted && links.length === 0 && !linkDraft.trim() && (
            <p className={cx('save-message', 'error')}>Please add at least one social presence link.</p>
          )}
          {submitted && achievements.length === 0 && !achievementDraft.trim() && (
            <p className={cx('save-message', 'error')}>Please add at least one achievement.</p>
          )}
          {submitted && projects.some(p => !!rows.missingIn(p as any).length) && (
            <p className={cx('save-message', 'error')}>Please fix the highlighted fields before continuing.</p>
          )}
          {saveError && <p className={cx('save-message', 'error')}>{saveError}</p>}
        </form>

        <div className={cx('step-actions')}>
          <Link className={cx('button', 'secondary')} href="/student/financial-information">Previous</Link>
          <button className={cx('button', 'primary')} type="button" disabled={saving} onClick={saveAndContinue}>
            {saving ? 'Saving…' : 'Continue'}
          </button>
        </div>
      </section>
    </div>
  );
}
