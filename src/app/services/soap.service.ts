import { Injectable, NgZone } from '@angular/core';
import { HeroService } from '../hero.service';
import { MOCK_DEPARTMENTS, MOCK_SKILLS, MOCK_USERS, MOCK_JOB_REQUISITIONS, MOCK_APPROVALS, MOCK_JOB_SKILLS, MOCK_PIPELINE_STAGES, MOCK_CANDIDATES, MOCK_CANDIDATE_SKILLS,  MOCK_APPLICATIONS,
  MOCK_OFFERS,
  MOCK_DELEGATES
} from './mock-data';

declare var $: any;

/**
 * Shared service that wraps the Cordys jQuery SOAP SDK calls.
 * Every component should use this instead of calling $.cordys.ajax directly.
 */
@Injectable({ providedIn: 'root' })
export class SoapService {

  public useMockData = false;

  private readonly NS = 'http://schemas.cordys.com/RMST1DatabaseMetadata';

  constructor(private ngZone: NgZone, private hero: HeroService) {}

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
    return this.hero.ajax(method, ns || this.NS, params);
  }

  /**
   * Extract tuples from a Cordys JSON response (dataType: '* json').
   * The response shape is: { tuple: [ { old: { <entity>: { ...fields } } }, ... ] }
   * or a single tuple object if only one row.
   */
  parseTuples(resp: any, entityName?: string): Record<string, string>[] {
    try {
      const tuples = $.cordys.json.find(resp, 'tuple');
      if (!tuples) return [];
      const tupleArr = Array.isArray(tuples) ? tuples : [tuples];
      return tupleArr.map((t: any) => {
        const old = t.old || t;
        // If entityName is provided, pick that sub-object; otherwise flatten
        if (entityName && old[entityName]) {
          return old[entityName];
        }
        // Try to find the first child object (the entity)
        const keys = Object.keys(old);
        for (const key of keys) {
          if (typeof old[key] === 'object' && old[key] !== null) {
            return old[key];
          }
        }
        return old;
      });
    } catch (e) {
      console.warn('[SoapService] parseTuples error:', e);
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════
  //  DEPARTMENTS
  // ═══════════════════════════════════════════════════════

  getDepartments(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_DEPARTMENTS);
    return this.call('GetMt_departmentsObjects', {
      fromDepartment_id: '0', toDepartment_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'mt_departments'));
  }

  // ═══════════════════════════════════════════════════════
  //  SKILLS
  // ═══════════════════════════════════════════════════════

  getSkills(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_SKILLS);
    return this.call('GetMt_skillsObjects', {
      fromSkill_id: '0', toSkill_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'mt_skills'));
  }

  // ═══════════════════════════════════════════════════════
  //  USERS
  // ═══════════════════════════════════════════════════════

  getUsers(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS);
    return this.call('GetTs_usersObjects', {
      fromUser_id: '0', toUser_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'ts_users'));
  }

  getUsersByDepartment(departmentId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS.filter(u => u.Department_id === departmentId));
    return this.call('GetTs_usersObjectsFordepartment_id', {
      Department_id: departmentId
    }).then(resp => this.parseTuples(resp, 'ts_users'));
  }

  getUserById(userId: string): Promise<Record<string, string> | null> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS.find((u: any) => u.User_id === userId) || null);
    return this.call('GetTs_usersObject', {
      User_id: userId
    }).then(resp => {
      const rows = this.parseTuples(resp, 'ts_users');
      return rows.length > 0 ? rows[0] : null;
    });
  }

  // ═══════════════════════════════════════════════════════
  //  JOB REQUISITIONS
  // ═══════════════════════════════════════════════════════

  getJobRequisitions(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_REQUISITIONS);
    return this.call('GetTs_job_requisitionsObjects', {
      fromRequisition_id: '0', toRequisition_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'ts_job_requisitions'));
  }

  getJobRequisitionsByCreator(userId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_REQUISITIONS.filter((j: any) => j.created_by_user === userId));
    return this.call('GetTs_job_requisitionsObjectsForcreated_by_user', {
      Created_by_user: userId
    }).then(resp => this.parseTuples(resp, 'ts_job_requisitions'));
  }

  getJobRequisitionById(requisitionId: string): Promise<Record<string, string> | null> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_REQUISITIONS.find((j: any) => j.requisition_id === requisitionId) || null);
    return this.call('GetTs_job_requisitionsObject', {
      Requisition_id: requisitionId
    }).then(resp => {
      const rows = this.parseTuples(resp, 'ts_job_requisitions');
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
    }).then(resp => this.parseTuples(resp, 'ts_job_skills'));
  }

  // ═══════════════════════════════════════════════════════
  //  APPROVALS
  // ═══════════════════════════════════════════════════════

  getApprovals(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPROVALS);
    return this.call('GetTs_approvalsObjects', {
      fromApproval_id: '0', toApproval_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'ts_approvals'));
  }

  getApprovalsByRequester(userId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPROVALS.filter((a: any) => a.requested_by === userId));
    return this.call('GetTs_approvalsObjectsForrequested_by', {
      Requested_by: userId
    }).then(resp => this.parseTuples(resp, 'ts_approvals'));
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
      fromStage_id: '0', toStage_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'mt_pipeline_stages'));
  }

  // ═══════════════════════════════════════════════════════
  //  CANDIDATES
  // ═══════════════════════════════════════════════════════

  getCandidates(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES);
    return this.call('GetTs_candidatesObjects', {
      fromCandidate_id: '0', toCandidate_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'ts_candidates'));
  }

  getCandidateById(candidateId: string): Promise<Record<string, string> | null> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES.find((c: any) => c.candidate_id === candidateId) || null);
    return this.call('GetTs_candidatesObject', {
      Candidate_id: candidateId
    }).then(resp => {
      const rows = this.parseTuples(resp, 'ts_candidates');
      return rows.length > 0 ? rows[0] : null;
    });
  }

  getCandidateByEmail(email: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES.filter((c: any) => c.email === email));
    return this.call('GetTs_candidatesObjectsforemail', {
      Email: email
    }).then(resp => this.parseTuples(resp, 'ts_candidates'));
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
    }).then(resp => this.parseTuples(resp, 'ts_candidate_skills'));
  }

  // ═══════════════════════════════════════════════════════
  //  APPLICATIONS
  // ═══════════════════════════════════════════════════════

  getApplications(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPLICATIONS);
    return this.call('GetTs_applicationsObjects', {
      fromApplication_id: '0', toApplication_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'ts_applications'));
  }

  getApplicationsByRequisition(requisitionId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPLICATIONS.filter((a: any) => a.requisition_id === requisitionId));
    return this.call('GetTs_applicationsObjectsForrequisition_id', {
      Requisition_id: requisitionId
    }).then(resp => this.parseTuples(resp, 'ts_applications'));
  }

  getApplicationsByCandidate(candidateId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_APPLICATIONS.filter((a: any) => a.candidate_id === candidateId));
    return this.call('GetTs_applicationsObjectsForcandidate_id', {
      Candidate_id: candidateId
    }).then(resp => this.parseTuples(resp, 'ts_applications'));
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
    }).then(resp => this.parseTuples(resp, 'hs_application_stage_history'));
  }

  // ═══════════════════════════════════════════════════════
  //  OFFERS
  // ═══════════════════════════════════════════════════════

  getOffers(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_OFFERS);
    return this.call('GetTs_offersObjects', {
      fromOffer_id: '0', toOffer_id: 'zzzzzzzzzz'
    }).then(resp => this.parseTuples(resp, 'ts_offers'));
  }

  getOffersByApplication(applicationId: string): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_OFFERS.filter(o => o['application_id'] === applicationId));
    return this.call('GetTs_offersObjectsForapplication_id', {
      Application_id: applicationId
    }).then(resp => this.parseTuples(resp, 'ts_offers'));
  }

  async insertOffer(applicationId: string, offerDetails: any): Promise<any> {
    if (this.useMockData) {
      const nextId = 'OFR-' + Date.now(); // Simplified ID generation for mock
      const newOffer = {
        offer_id: nextId,
        application_id: applicationId,
        candidate_id: offerDetails.candidate_id || '',
        offered_salary: offerDetails.offered_salary || '',
        salary_currency: offerDetails.salary_currency || 'LPA',
        joining_date: offerDetails.joining_date || '',
        expiration_date: offerDetails.expiration_date || '',
        status: offerDetails.status || 'DRAFT',
        created_by_user: offerDetails.created_by_user || '',
        created_at: new Date().toISOString()
      };
      MOCK_OFFERS.push(newOffer);
      return Promise.resolve({ success: true, offer_id: nextId });
    }
    return this.call('UpdateTs_offers', {
      tuple: {
        'new': {
          ts_offers: {
            application_id: applicationId,
            offered_salary: offerDetails.offered_salary || offerDetails.salary || '',
            salary_currency: offerDetails.salary_currency || offerDetails.currency || 'LPA',
            joining_date: offerDetails.joining_date || '',
            expiration_date: offerDetails.expiration_date || '',
            status: offerDetails.status || 'DRAFT',
            created_by_user: offerDetails.created_by_user || '',
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    });
  }

  updateOfferStatus(offerId: string, newStatus: string): Promise<any> {
    if (this.useMockData) {
      const offer = MOCK_OFFERS.find(o => o['offer_id'] === offerId);
      if (offer) offer['status'] = newStatus;
      return Promise.resolve({ success: true });
    }
    // For Cordys, we need old+new tuple; simplified here
    return this.call('UpdateTs_offers', {
      tuple: {
        old: { ts_offers: { offer_id: offerId } },
        'new': { ts_offers: { offer_id: offerId, status: newStatus } }
      }
    });
  }

  // ═══════════════════════════════════════════════════
  //  DELEGATES
  // ═══════════════════════════════════════════════════
  async getDelegates(managerId: string): Promise<string[]> {
    if (!this.useMockData) {
      // Cordys implementation here if needed
      return [];
    }
    await this.delay(300);
    const existing = MOCK_DELEGATES.find(d => d.manager_id === managerId);
    return existing ? [...existing.delegate_ids] : [];
  }

  async updateDelegates(managerId: string, delegateIds: string[]): Promise<any> {
    if (!this.useMockData) {
      // Cordys implementation here
      return { success: true };
    }
    await this.delay(500);
    const existingPos = MOCK_DELEGATES.findIndex(d => d.manager_id === managerId);
    if (existingPos >= 0) {
      MOCK_DELEGATES[existingPos].delegate_ids = [...delegateIds];
    } else {
      MOCK_DELEGATES.push({ manager_id: managerId, delegate_ids: [...delegateIds] });
    }
    return Promise.resolve({ success: true });
  }
}

