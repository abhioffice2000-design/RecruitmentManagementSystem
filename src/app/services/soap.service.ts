import { Injectable, NgZone } from '@angular/core';
import { MOCK_DEPARTMENTS, MOCK_SKILLS, MOCK_USERS, MOCK_JOB_REQUISITIONS, MOCK_APPROVALS, MOCK_JOB_SKILLS, MOCK_PIPELINE_STAGES, MOCK_CANDIDATES, MOCK_CANDIDATE_SKILLS, MOCK_APPLICATIONS } from './mock-data';

declare var $: any;

/**
 * Shared service that wraps the Cordys jQuery SOAP SDK calls.
 * Every component should use this instead of calling $.cordys.ajax directly.
 */
@Injectable({ providedIn: 'root' })
export class SoapService {

  public useMockData = true;

  private readonly NS = 'http://schemas.cordys.com/RMST1DatabaseMetadata';

  constructor(private ngZone: NgZone) {}

  // ═══════════════════════════════════════════════════════
  //  GENERIC HELPERS
  // ═══════════════════════════════════════════════════════

  /**
   * Execute a Cordys SOAP call and return a Promise.
   * @param method  SOAP method name
   * @param params  Parameters object
   * @param ns      Namespace (defaults to RMST1DatabaseMetadata)
   */
  call(method: string, params: any, ns?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof $ === 'undefined' || typeof $.cordys === 'undefined') {
        reject(new Error('Cordys SDK not loaded'));
        return;
      }
      $.cordys.ajax({
        method,
        namespace: ns || this.NS,
        parameters: params,
        dataType: 'xml'
      })
      .done((xml: any) => {
        this.ngZone.run(() => resolve(xml));
      })
      .fail((err: any) => {
        this.ngZone.run(() => reject(err));
      });
    });
  }

  /**
   * Parse all <tuple> elements from a SOAP XML response into an array of
   * plain objects, keyed by child element tag names.
   */
  parseTuples(xml: any): Record<string, string>[] {
    const rows = xml.getElementsByTagName('tuple');
    const results: Record<string, string>[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const obj: Record<string, string> = {};
      // The actual data is inside <old> or the direct children
      const dataNode = row.getElementsByTagName('old')[0] || row;
      const children = dataNode.children || dataNode.childNodes;
      for (let j = 0; j < children.length; j++) {
        const child = children[j];
        if (child.nodeType === 1) { // ELEMENT_NODE
          // Go one level deeper for the actual table row element
          if (child.children && child.children.length > 0) {
            for (let k = 0; k < child.children.length; k++) {
              const field = child.children[k];
              if (field.nodeType === 1) {
                obj[field.tagName] = field.textContent || '';
              }
            }
          } else {
            obj[child.tagName] = child.textContent || '';
          }
        }
      }
      if (Object.keys(obj).length > 0) {
        results.push(obj);
      }
    }
    return results;
  }

  // ═══════════════════════════════════════════════════════
  //  DEPARTMENTS
  // ═══════════════════════════════════════════════════════

  getDepartments(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_DEPARTMENTS);
    return this.call('GetMt_departmentsObjects', {
      fromDepartment_id: '', toDepartment_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  // ═══════════════════════════════════════════════════════
  //  SKILLS
  // ═══════════════════════════════════════════════════════

  getSkills(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_SKILLS);
    return this.call('GetMt_skillsObjects', {
      fromSkill_id: '', toSkill_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  // ═══════════════════════════════════════════════════════
  //  USERS
  // ═══════════════════════════════════════════════════════

  getUsers(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS);
    return this.call('GetTs_usersObjects', {
      fromUser_id: '', toUser_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  getUsersByDepartment(departmentId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS.filter(u => u.Department_id === departmentId));
    return this.call('GetTs_usersObjectsFordepartment_id', {
      Department_id: departmentId
    }).then(xml => this.parseTuples(xml));
  }

  getUserById(userId: string): Promise<Record<string, string> | null> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS.find((u: any) => u.User_id === userId) || null);
    return this.call('GetTs_usersObject', {
      User_id: userId
    }).then(xml => {
      const rows = this.parseTuples(xml);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  // ═══════════════════════════════════════════════════════
  //  JOB REQUISITIONS
  // ═══════════════════════════════════════════════════════

  getJobRequisitions(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_REQUISITIONS);
    return this.call('GetTs_job_requisitionsObjects', {
      fromRequisition_id: '', toRequisition_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  getJobRequisitionsByCreator(userId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_REQUISITIONS.filter((j: any) => j.created_by_user === userId));
    return this.call('GetTs_job_requisitionsObjectsForcreated_by_user', {
      Created_by_user: userId
    }).then(xml => this.parseTuples(xml));
  }

  getJobRequisitionById(requisitionId: string): Promise<Record<string, string> | null> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_REQUISITIONS.find((j: any) => j.requisition_id === requisitionId) || null);
    return this.call('GetTs_job_requisitionsObject', {
      Requisition_id: requisitionId
    }).then(xml => {
      const rows = this.parseTuples(xml);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  insertJobRequisition(data: {
    title: string;
    department_id: string;
    description: string;
    experience_min: string;
    experience_max: string;
    salary_min: string;
    salary_max: string;
    salary_currency: string;
    open_positions: string;
    posting_source: string;
    created_by_user: string;
  }): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_job_requisitions', {
      tuple: {
        'new': {
          ts_job_requisitions: {
            requisition_id: '',
            title: data.title,
            department_id: data.department_id,
            description: data.description,
            experience_min: data.experience_min,
            experience_max: data.experience_max,
            salary_min: data.salary_min,
            salary_max: data.salary_max,
            salary_currency: data.salary_currency,
            open_positions: data.open_positions,
            status: 'PENDING',
            posting_source: data.posting_source,
            created_by_user: data.created_by_user,
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  updateJobRequisitionStatus(oldData: Record<string, string>, newStatus: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_job_requisitions', {
      tuple: {
        old: {
          ts_job_requisitions: {
            requisition_id: oldData['requisition_id'],
            title: oldData['title'],
            department_id: oldData['department_id'],
            description: oldData['description'] || '',
            experience_min: oldData['experience_min'] || '',
            experience_max: oldData['experience_max'] || '',
            salary_min: oldData['salary_min'] || '',
            salary_max: oldData['salary_max'] || '',
            salary_currency: oldData['salary_currency'] || '',
            open_positions: oldData['open_positions'] || '',
            status: oldData['status'],
            posting_source: oldData['posting_source'] || '',
            created_by_user: oldData['created_by_user'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        },
        'new': {
          ts_job_requisitions: {
            requisition_id: oldData['requisition_id'],
            title: oldData['title'],
            department_id: oldData['department_id'],
            description: oldData['description'] || '',
            experience_min: oldData['experience_min'] || '',
            experience_max: oldData['experience_max'] || '',
            salary_min: oldData['salary_min'] || '',
            salary_max: oldData['salary_max'] || '',
            salary_currency: oldData['salary_currency'] || '',
            open_positions: oldData['open_positions'] || '',
            status: newStatus,
            posting_source: oldData['posting_source'] || '',
            created_by_user: oldData['created_by_user'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  //  JOB SKILLS
  // ═══════════════════════════════════════════════════════

  insertJobSkill(requisitionId: string, skillId: string, requiredLevel: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_job_skills', {
      tuple: {
        'new': {
          ts_job_skills: {
            requisition_id: requisitionId,
            skill_id: skillId,
            required_level: requiredLevel,
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  getJobSkillsByRequisition(requisitionId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_SKILLS.filter((s: any) => s.requisition_id === requisitionId));
    return this.call('GetTs_job_skillsObjectsForrequisition_id', {
      Requisition_id: requisitionId
    }).then(xml => this.parseTuples(xml));
  }

  // ═══════════════════════════════════════════════════════
  //  APPROVALS
  // ═══════════════════════════════════════════════════════

  getApprovals(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPROVALS);
    return this.call('GetTs_approvalsObjects', {
      fromApproval_id: '', toApproval_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  getApprovalsByRequester(userId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPROVALS.filter((a: any) => a.requested_by === userId));
    return this.call('GetTs_approvalsObjectsForrequested_by', {
      Requested_by: userId
    }).then(xml => this.parseTuples(xml));
  }

  insertApproval(data: {
    entity_type: string;
    entity_id: string;
    requested_by: string;
    comments: string;
  }): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_approvals', {
      tuple: {
        'new': {
          ts_approvals: {
            approval_id: '',
            entity_type: data.entity_type,
            entity_id: data.entity_id,
            status: 'PENDING',
            requested_by: data.requested_by,
            approved_by: '',
            comments: data.comments,
            requested_at: new Date().toISOString(),
            approved_at: '',
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  updateApprovalStatus(oldData: Record<string, string>, newStatus: string, approvedBy: string, comments: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_approvals', {
      tuple: {
        old: {
          ts_approvals: {
            approval_id: oldData['approval_id'],
            entity_type: oldData['entity_type'],
            entity_id: oldData['entity_id'],
            status: oldData['status'],
            requested_by: oldData['requested_by'],
            approved_by: oldData['approved_by'] || '',
            comments: oldData['comments'] || '',
            requested_at: oldData['requested_at'] || '',
            approved_at: oldData['approved_at'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        },
        'new': {
          ts_approvals: {
            approval_id: oldData['approval_id'],
            entity_type: oldData['entity_type'],
            entity_id: oldData['entity_id'],
            status: newStatus,
            requested_by: oldData['requested_by'],
            approved_by: approvedBy,
            comments: comments || oldData['comments'] || '',
            requested_at: oldData['requested_at'] || '',
            approved_at: new Date().toISOString(),
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  //  PIPELINE STAGES
  // ═══════════════════════════════════════════════════════

  getPipelineStages(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_PIPELINE_STAGES);
    return this.call('GetMt_pipeline_stagesObjects', {
      fromStage_id: '', toStage_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  // ═══════════════════════════════════════════════════════
  //  CANDIDATES
  // ═══════════════════════════════════════════════════════

  getCandidates(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES);
    return this.call('GetTs_candidatesObjects', {
      fromCandidate_id: '', toCandidate_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  getCandidateById(candidateId: string): Promise<Record<string, string> | null> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES.find((c: any) => c.candidate_id === candidateId) || null);
    return this.call('GetTs_candidatesObject', {
      Candidate_id: candidateId
    }).then(xml => {
      const rows = this.parseTuples(xml);
      return rows.length > 0 ? rows[0] : null;
    });
  }

  getCandidateByEmail(email: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES.filter((c: any) => c.email === email));
    return this.call('GetTs_candidatesObjectsforemail', {
      Email: email
    }).then(xml => this.parseTuples(xml));
  }

  insertCandidate(data: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    linkedin_url: string;
    experience_years: string;
    location: string;
  }): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_candidates', {
      tuple: {
        'new': {
          ts_candidates: {
            candidate_id: '',
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            linkedin_url: data.linkedin_url,
            experience_years: data.experience_years,
            location: data.location,
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  //  CANDIDATE SKILLS
  // ═══════════════════════════════════════════════════════

  insertCandidateSkill(candidateId: string, skillId: string, experienceYears: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_candidate_skills', {
      tuple: {
        'new': {
          ts_candidate_skills: {
            candidate_id: candidateId,
            skill_id: skillId,
            experience_years: experienceYears,
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  getCandidateSkills(candidateId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATE_SKILLS.filter((s: any) => s.candidate_id === candidateId));
    return this.call('GetTs_candidate_skillsObjectsForcandidate_id', {
      Candidate_id: candidateId
    }).then(xml => this.parseTuples(xml));
  }

  // ═══════════════════════════════════════════════════════
  //  APPLICATIONS
  // ═══════════════════════════════════════════════════════

  getApplications(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPLICATIONS);
    return this.call('GetTs_applicationsObjects', {
      fromApplication_id: '', toApplication_id: ''
    }).then(xml => this.parseTuples(xml));
  }

  getApplicationsByRequisition(requisitionId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPLICATIONS.filter((a: any) => a.requisition_id === requisitionId));
    return this.call('GetTs_applicationsObjectsForrequisition_id', {
      Requisition_id: requisitionId
    }).then(xml => this.parseTuples(xml));
  }

  getApplicationsByCandidate(candidateId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPLICATIONS.filter((a: any) => a.candidate_id === candidateId));
    return this.call('GetTs_applicationsObjectsForcandidate_id', {
      Candidate_id: candidateId
    }).then(xml => this.parseTuples(xml));
  }

  insertApplication(data: {
    candidate_id: string;
    requisition_id: string;
    source: string;
    current_stage_id: string;
    notes: string;
  }): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_applications', {
      tuple: {
        'new': {
          ts_applications: {
            application_id: '',
            candidate_id: data.candidate_id,
            requisition_id: data.requisition_id,
            source: data.source,
            referred_by: '',
            current_stage_id: data.current_stage_id,
            status: 'ACTIVE',
            notes: data.notes,
            applied_at: new Date().toISOString(),
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  updateApplicationStage(oldData: Record<string, string>, newStageId: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_applications', {
      tuple: {
        old: {
          ts_applications: {
            application_id: oldData['application_id'],
            candidate_id: oldData['candidate_id'],
            requisition_id: oldData['requisition_id'],
            source: oldData['source'] || '',
            referred_by: oldData['referred_by'] || '',
            current_stage_id: oldData['current_stage_id'] || '',
            status: oldData['status'],
            notes: oldData['notes'] || '',
            applied_at: oldData['applied_at'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        },
        'new': {
          ts_applications: {
            application_id: oldData['application_id'],
            candidate_id: oldData['candidate_id'],
            requisition_id: oldData['requisition_id'],
            source: oldData['source'] || '',
            referred_by: oldData['referred_by'] || '',
            current_stage_id: newStageId,
            status: oldData['status'],
            notes: oldData['notes'] || '',
            applied_at: oldData['applied_at'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        }
      }
    });
  }

  updateApplicationStatus(oldData: Record<string, string>, newStatus: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_applications', {
      tuple: {
        old: {
          ts_applications: {
            application_id: oldData['application_id'],
            candidate_id: oldData['candidate_id'],
            requisition_id: oldData['requisition_id'],
            source: oldData['source'] || '',
            referred_by: oldData['referred_by'] || '',
            current_stage_id: oldData['current_stage_id'] || '',
            status: oldData['status'],
            notes: oldData['notes'] || '',
            applied_at: oldData['applied_at'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        },
        'new': {
          ts_applications: {
            application_id: oldData['application_id'],
            candidate_id: oldData['candidate_id'],
            requisition_id: oldData['requisition_id'],
            source: oldData['source'] || '',
            referred_by: oldData['referred_by'] || '',
            current_stage_id: oldData['current_stage_id'] || '',
            status: newStatus,
            notes: oldData['notes'] || '',
            applied_at: oldData['applied_at'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || ''
          }
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════
  //  APPLICATION STAGE HISTORY
  // ═══════════════════════════════════════════════════════

  insertStageHistory(data: {
    application_id: string;
    from_stage_id: string;
    to_stage_id: string;
    changed_by: string;
    comments: string;
  }): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateHs_application_stage_history', {
      tuple: {
        'new': {
          hs_application_stage_history: {
            history_id: '',
            application_id: data.application_id,
            from_stage_id: data.from_stage_id,
            to_stage_id: data.to_stage_id,
            changed_by: data.changed_by,
            changed_at: new Date().toISOString(),
            comments: data.comments,
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  getStageHistory(applicationId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve([]);
    return this.call('GetHs_application_stage_historyObjectsForapplication_id', {
      Application_id: applicationId
    }).then(xml => this.parseTuples(xml));
  }
}

