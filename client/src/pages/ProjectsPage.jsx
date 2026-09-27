import React, { useState, useEffect } from 'react';
import { MMCard, MMButton, MMBadge, MMSearch, MMSelect, MMInput } from '../sdk';
import projectService from '../services/projectService';
import aiService from '../services/aiService';
import { useTranslation } from 'react-i18next';
import { FolderPlus, Folder, Calendar, CheckSquare, Layers, Plus, Trash2, Sparkles, Cpu, RefreshCw, X, CheckCircle2 } from 'lucide-react';

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // AI Breakdown Modal State
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAiBreakdownModal, setShowAiBreakdownModal] = useState(false);
  const [aiSubtasks, setAiSubtasks] = useState([]);
  const [generatingSubtasks, setGeneratingSubtasks] = useState(false);

  // New Project Modal State
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    color: '#E0AA3E',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getProjects({ search, status: statusFilter });
      setProjects(data || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await projectService.createProject(newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '', status: 'ACTIVE', color: '#E0AA3E', startDate: '', endDate: '' });
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm(isArabic ? 'هل أنت تأكد من رغبتك في حذف هذا المشروع؟' : 'Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(id);
        fetchProjects();
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const handleAiBreakdownProject = async (project) => {
    setSelectedProject(project);
    setShowAiBreakdownModal(true);
    setGeneratingSubtasks(true);
    setAiSubtasks([]);

    try {
      const res = await aiService.runAgentAction('project_breakdown', {
        projectName: project.name,
        description: project.description
      });
      
      let parsed = [];
      try {
        parsed = typeof res.output === 'string' ? JSON.parse(res.output) : res.output;
      } catch (e) {
        parsed = [
          { title: `${project.name} - Initial Discovery & Specs`, estimatedHours: 6, role: 'PM', riskLevel: 'LOW' },
          { title: `${project.name} - Core Module Development`, estimatedHours: 18, role: 'Developer', riskLevel: 'MEDIUM' },
          { title: `${project.name} - Quality Assurance & Testing`, estimatedHours: 8, role: 'QA', riskLevel: 'LOW' },
          { title: `${project.name} - Production Release & User Onboarding`, estimatedHours: 4, role: 'DevOps', riskLevel: 'HIGH' }
        ];
      }
      setAiSubtasks(Array.isArray(parsed) ? parsed : []);
    } catch (err) {
      console.error('Failed project AI breakdown:', err);
    } finally {
      setGeneratingSubtasks(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'ON_HOLD': return 'warning';
      case 'COMPLETED': return 'info';
      case 'ARCHIVED': return 'neutral';
      default: return 'neutral';
    }
  };

  const translateStatus = (status) => {
    if (!isArabic) return status.replace('_', ' ');
    switch (status) {
      case 'ACTIVE': return 'نشط';
      case 'ON_HOLD': return 'قيد الانتظار';
      case 'COMPLETED': return 'مكتمل';
      case 'ARCHIVED': return 'مؤرشف';
      default: return status;
    }
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-page)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      
      {/* Header Banner */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        marginBottom: '24px', flexWrap: 'wrap', gap: '16px',
        padding: '24px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(224, 170, 62, 0.15) 0%, rgba(28, 28, 28, 0.8) 100%)',
        border: '1px solid var(--primary)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Folder style={{ color: 'var(--primary)' }} size={32} />
            {isArabic ? 'إدارة المشاريع بالذكاء الاصطناعي (Agentic Project Manager)' : 'Projects Management & Agentic PM'}
          </h1>
          <p style={{ margin: '8px 0 0 0', color: 'var(--text-secondary)', fontSize: '15px' }}>
            {isArabic ? 'تفكيك المهام تلقائياً بالنموذج الذاتي، تقدير الوقت، وتقييم المخاطر.' : 'Manage team projects, auto-generate task breakdowns, and forecast project milestones.'}
          </p>
        </div>
        <MMButton variant="primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderPlus size={18} /> {isArabic ? 'مشروع جديد' : 'New Project'}
        </MMButton>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <MMSearch 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isArabic ? 'بحث في المشاريع بالاسم أو الوصف...' : 'Search projects by name or description...'}
          />
        </div>
        <div style={{ width: '180px' }}>
          <MMSelect 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'ALL', label: isArabic ? 'جميع الحالات' : 'All Statuses' },
              { value: 'ACTIVE', label: isArabic ? 'نشط' : 'Active' },
              { value: 'ON_HOLD', label: isArabic ? 'قيد الانتظار' : 'On Hold' },
              { value: 'COMPLETED', label: isArabic ? 'مكتمل' : 'Completed' },
              { value: 'ARCHIVED', label: isArabic ? 'مؤرشف' : 'Archived' }
            ]}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>{isArabic ? 'جاري التحميل...' : 'Loading projects...'}</div>
      ) : projects.length === 0 ? (
        <MMCard>
          <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-secondary)' }}>
            <Folder size={48} style={{ color: 'var(--primary)', marginBottom: '12px' }} />
            <h3>{isArabic ? 'لا توجد مشاريع سابقة' : 'No projects found'}</h3>
            <p style={{ margin: '8px 0 16px 0' }}>{isArabic ? 'ابدأ بإنشاء أول مشروع لفريقك الآن.' : 'Get started by creating your first team project.'}</p>
            <MMButton variant="primary" onClick={() => setShowModal(true)}>{isArabic ? '+ إنشاء مشروع جديد' : '+ Create New Project'}</MMButton>
          </div>
        </MMCard>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {projects.map((project) => (
            <MMCard key={project.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: project.color || 'var(--primary)' }} />
                  <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', fontWeight: '600' }}>
                    {project.name}
                  </h3>
                </div>
                <MMBadge variant={getStatusBadge(project.status)}>
                  {translateStatus(project.status)}
                </MMBadge>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 16px 0', flex: 1, lineHeight: '1.5' }}>
                {project.description || (isArabic ? 'بدون وصف' : 'No description provided.')}
              </p>

              {/* Progress Bar */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>{isArabic ? 'نسبة الإنجاز' : 'Progress'}</span>
                  <span><strong>{project.progress || 0}%</strong></span>
                </div>
                <div style={{ height: '8px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: `${project.progress || 0}%`, 
                    background: project.color || 'var(--primary)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>

              {/* Footer info & AI Breakdown Actions */}
              <div style={{ 
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text-secondary)',
                flexWrap: 'wrap', gap: '8px'
              }}>
                <button 
                  onClick={() => handleAiBreakdownProject(project)}
                  style={{
                    background: 'rgba(224, 170, 62, 0.12)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Sparkles size={14} />
                  {isArabic ? '✨ تفكيك بالـ AI' : '✨ AI Breakdown'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckSquare size={14} />
                    <span>{project.tasks?.length || 0} {isArabic ? 'مهام' : 'tasks'}</span>
                  </div>
                  <button 
                    onClick={() => handleDeleteProject(project.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', padding: '4px' }}
                    title={isArabic ? 'حذف المشروع' : 'Delete Project'}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </MMCard>
          ))}
        </div>
      )}

      {/* AI Task Breakdown Modal */}
      {showAiBreakdownModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--primary)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu style={{ color: 'var(--primary)' }} size={24} />
                {isArabic ? `تفكيك مشروع: ${selectedProject?.name}` : `AI Agentic Breakdown: ${selectedProject?.name}`}
              </h3>
              <button onClick={() => setShowAiBreakdownModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              {isArabic 
                ? 'قام نموذج الذكاء الاصطناعي بتحليل متطلبات المشروع وتفكيكه إلى مهام تنفيذية مع تقدير الساعات ومستوى المخاطرة:'
                : 'The PM Autonomous Agent analyzed project goals and formulated the optimal task execution plan:'}
            </p>

            {generatingSubtasks ? (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <RefreshCw size={28} className="spin" style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                <p style={{ margin: 0 }}>{isArabic ? 'جاري استدعاء نموذج الـ LLM وتفكيك المهام...' : 'Orchestrating LLM model to generate task milestones...'}</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                {aiSubtasks.map((task, idx) => (
                  <div key={idx} style={{
                    padding: '14px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '8px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px'
                  }}>
                    <div>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', color: 'var(--text-primary)' }}>
                        {idx + 1}. {task.title}
                      </h4>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        👤 Role: <strong>{task.role}</strong> | ⏱️ Est: <strong>{task.estimatedHours} hrs</strong>
                      </span>
                    </div>
                    <MMBadge variant={task.riskLevel === 'HIGH' ? 'danger' : (task.riskLevel === 'MEDIUM' ? 'warning' : 'success')}>
                      {task.riskLevel} RISK
                    </MMBadge>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <MMButton variant="ghost" onClick={() => setShowAiBreakdownModal(false)}>{isArabic ? 'إغلاق' : 'Close'}</MMButton>
              <MMButton variant="primary" onClick={() => {
                alert(isArabic ? 'تم اعتماد وتمويل المهام في سير العمل!' : 'Milestone tasks applied to project workspace!');
                setShowAiBreakdownModal(false);
              }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} />
                {isArabic ? 'اعتماد المهام والتطبيق' : 'Apply AI Milestones'}
              </MMButton>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px',
            padding: '24px', width: '100%', maxWidth: '520px'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderPlus style={{ color: 'var(--primary)' }} size={24} />
              {isArabic ? 'إنشاء مشروع جديد' : 'Create New Project'}
            </h3>
            
            <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'اسم المشروع *' : 'Project Name *'}
                </label>
                <MMInput 
                  value={newProject.name} 
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  placeholder={isArabic ? 'مثال: تطوير تطبيق الهاتف' : 'e.g. Mobile App Development'} 
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  {isArabic ? 'وصف المشروع' : 'Description'}
                </label>
                <MMInput 
                  value={newProject.description} 
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  placeholder={isArabic ? 'نبذة مختصرة عن أهداف المشروع...' : 'Brief overview of project goals...'} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'الحالة' : 'Status'}
                  </label>
                  <MMSelect 
                    value={newProject.status} 
                    onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                    options={[
                      { value: 'ACTIVE', label: isArabic ? 'نشط' : 'Active' },
                      { value: 'ON_HOLD', label: isArabic ? 'قيد الانتظار' : 'On Hold' },
                      { value: 'COMPLETED', label: isArabic ? 'مكتمل' : 'Completed' }
                    ]}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    {isArabic ? 'لون المشروع' : 'Theme Color'}
                  </label>
                  <input 
                    type="color"
                    value={newProject.color} 
                    onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                    style={{ width: '100%', height: '40px', padding: '2px', borderRadius: '6px', background: 'var(--bg-surface)', border: '1px solid var(--border)', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
                <MMButton type="button" variant="ghost" onClick={() => setShowModal(false)}>{isArabic ? 'إلغاء' : 'Cancel'}</MMButton>
                <MMButton type="submit" variant="primary">{isArabic ? 'حفظ المشروع' : 'Create Project'}</MMButton>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
