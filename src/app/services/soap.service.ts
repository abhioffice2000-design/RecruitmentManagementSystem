import { Injectable, NgZone } from '@angular/core';
import { HeroService } from '../hero.service';
import {
  MOCK_DEPARTMENTS, MOCK_SKILLS, MOCK_USERS, MOCK_JOB_REQUISITIONS, MOCK_APPROVALS, MOCK_JOB_SKILLS, MOCK_PIPELINE_STAGES, MOCK_CANDIDATES, MOCK_CANDIDATE_SKILLS, MOCK_APPLICATIONS,
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

  constructor(private ngZone: NgZone, private hero: HeroService) { }

  // ═══════════════════════════════════════════════════════
  //  GENERIC HELPERS
  // ═══════════════════════════════════════════════════════

  /**
   * Execute a Cordys SOAP call and return a Promise.
   * @param method  SOAP method name
   * @param params  Parameters object or XML string
   * @param ns      Namespace (defaults to RMST1DatabaseMetadata)
   * @param attributes Optional attributes for the method element (e.g. {reply: 'yes'})
   */
  call(method: string, params: any, ns?: string, data?: string): Promise<any> {
    return this.hero.ajax(method, ns || this.NS, params, data);
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

  /**
   * Fetch all departments from the database.
   * Uses the GetAllDepartments SOAP method.
   */
  getAllDepartments(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_DEPARTMENTS);
    return this.call('GetAllDepartments', {}).then(xml => this.parseTuples(xml));
  }

  insertDepartment(data: {
    department_name: string;
    created_by: string;
  }): Promise<any> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (this.useMockData) {
      MOCK_DEPARTMENTS.push({
        department_id: 'D' + String(MOCK_DEPARTMENTS.length + 1).padStart(2, '0'),
        department_name: data.department_name,
        manager_id: ''
      });
      return Promise.resolve({ success: true });
    }
    return this.call('UpdateMt_departments', {
      tuple: {
        'new': {
          mt_departments: {
            '@qAccess': '0',
            '@qConstraint': '0',
            '@qInit': '0',
            '@qValues': '',
            department_name: data.department_name,
            created_at: now,
            created_by: data.created_by,
            updated_at: now,
            updated_by: data.created_by,
            temp1: '', temp2: '', temp3: '', temp4: '', temp5: ''
          }
        }
      }
    }, undefined,);
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

  getAllManagers(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS.filter((u: any) => u.Role === 'MANAGER' || u.Role === 'LEADERSHIP'));
    return this.call('GetAllManagers', {
      preserveSpace: 'no',
      qAccess: '0',
      qValues: ''
    }).then(xml => this.parseTuples(xml));
  }

  getAllHR(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS.filter((u: any) => u.Role === 'HR'));
    return this.call('GetAllHR', {
      preserveSpace: 'no',
      qAccess: '0',
      qValues: ''
    }).then(xml => this.parseTuples(xml));
  }

  getAllInterviewers(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_USERS.filter((u: any) => u.Role === 'INTERVIEWER'));
    return this.call('GetAllInterviewers', {
      preserveSpace: 'no',
      qAccess: '0',
      qValues: ''
    }).then(xml => this.parseTuples(xml));
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

  insertUser(data: {
    first_name: string;
    last_name: string;
    email: string;
    password_hash: string;
    role: string;
    status: string;
    department_id: string;
    created_by: string;
    temp1?: string;
    temp2?: string;
    temp3?: string;
    temp4?: string;
    temp5?: string;
  }): Promise<any> {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_users', {
      tuple: {
        'new': {
          ts_users: {
            '@qAccess': '0',
            '@qConstraint': '0',
            '@qInit': '0',
            '@qValues': '',
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password_hash: data.password_hash,
            role: data.role,
            status: data.status,
            department_id: data.department_id,
            created_at: now,
            created_by: data.created_by,
            updated_at: now,
            updated_by: data.created_by,
            temp1: data.temp1 || '',
            temp2: data.temp2 || '',
            temp3: data.temp3 || '',
            temp4: data.temp4 || '',
            temp5: data.temp5 || ''
          }
        }
      }
    }).then(resp => {
      const rows = this.parseTuples(resp, 'ts_users');
      return rows.length > 0 ? rows[0] : resp;
    });
  }

  deleteUser(userData: any): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });

    const userId = userData.user_id || userData.User_id || userData.id;
    console.log(`[SoapService] Deleting user ${userId}`);

    return this.call('UpdateTs_users', {
      tuple: {
        'old': {
          ts_users: {
            user_id: userId
          }
        }
      }
    });
  }

  updateUserStatus(userData: any, newStatus: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });

    // Use the database ID (user_id) for the update
    const userId = userData.user_id || userData.User_id || userData.id;

    console.log(`[SoapService] Updating status for user ${userId} to ${newStatus}`);

    return this.call('UpdateTs_users', {
      tuple: {
        'old': {
          ts_users: {
            user_id: userId
          }
        },
        'new': {
          ts_users: {
            user_id: userId,
            status: newStatus,
            updated_at: new Date().toISOString().replace('T', ' ').slice(0, 19),
            updated_by: 'admin'
          }
        }
      }
    });
  }

  updateUser(oldData: any, newData: any): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });

    // Core update logic using the tuple pattern
    // Cordys Update service expects the 'old' element to contain identifying fields (like user_id)
    // and the 'new' element to contain the updated values.

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    return this.call('UpdateTs_users', {
      tuple: {
        'old': {
          ts_users: {
            user_id: oldData.user_id || oldData.User_id
          }
        },
        'new': {
          ts_users: {
            user_id: oldData.user_id || oldData.User_id,
            first_name: newData.first_name,
            last_name: newData.last_name,
            email: newData.email,
            password_hash: newData.password_hash || oldData.password_hash,
            role: newData.role,
            status: newData.status,
            department_id: newData.department_id,
            updated_at: now,
            updated_by: newData.updated_by || 'admin',
            temp1: newData.temp1 || '',
            temp2: newData.temp2 || '',
            temp3: newData.temp3 || '',
            temp4: newData.temp4 || '',
            temp5: newData.temp5 || ''
          }
        }
      }
    });
  }

  updateDepartment(oldData: any, newData: any): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    return this.call('UpdateMt_departments', {
      tuple: {
        'old': {
          mt_departments: {
            department_id: oldData.department_id || oldData.id
          }
        },
        'new': {
          mt_departments: {
            department_id: oldData.department_id || oldData.id,
            department_name: newData.department_name,
            updated_at: now,
            updated_by: newData.updated_by || 'admin',
            temp1: newData.temp1 || '',
            temp2: newData.temp2 || '',
            temp3: newData.temp3 || '',
            temp4: newData.temp4 || '',
            temp5: newData.temp5 || ''
          }
        }
      }
    });
  }

  /**
   * Create a user in the Cordys Organization.
   * Uses the UserManagement namespace.
   */
  createUserInOrganization(data: {
    userName: string;
    description: string;
    password: string;
    role: string;
  }): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });

    // Construct Raw XML string to be 100% accurate to the user's requested SOAP structure
    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <CreateUserInOrganization xmlns="http://schemas.cordys.com/UserManagement/1.0/Organization">
      <User>
        <UserName isAnonymous="">${data.userName}</UserName>
        <Description>${data.description}</Description>
        <Credentials allowDuplicate="true">
          <UserIDPassword>
            <UserID>${data.userName}</UserID>
            <Password>${data.password}</Password>
          </UserIDPassword>
        </Credentials>
        <Roles>
          <Role application="">${data.role}</Role>
        </Roles>
      </User>
    </CreateUserInOrganization>
  </SOAP:Body>
</SOAP:Envelope>`;

    return this.call('CreateUserInOrganization', {}, 'http://schemas.cordys.com/UserManagement/1.0/Organization', soapXml);
  }

  /**
   * Assign a Cordys role to a user.
   * Uses the UserManagement namespace, not the DB metadata namespace.
   */
  assignRoleToUser(userName: string, roleName: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });

    // Construct Raw XML string to be 100% accurate to the user's requested SOAP structure
    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <AssignRolesToUser xmlns="http://schemas.cordys.com/UserManagement/1.0/Organization">
      <User>
        <UserName>${userName}</UserName>
        <Roles>
          <Role application="">${roleName}</Role>
        </Roles>
      </User>
    </AssignRolesToUser>
  </SOAP:Body>
</SOAP:Envelope>`;

    return this.call('AssignRolesToUser', {}, 'http://schemas.cordys.com/UserManagement/1.0/Organization', soapXml);
  }

  /**
   * Remove a Cordys role from a user.
   * Uses the RemoveRolesFromUser SOAP method.
   */
  removeRoleFromUser(userName: string, roleName: string): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });

    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <RemoveRolesFromUser xmlns="http://schemas.cordys.com/UserManagement/1.0/Organization">
      <User>
        <UserName>${userName}</UserName>
        <Roles>
          <Role application="">${roleName}</Role>
        </Roles>
      </User>
    </RemoveRolesFromUser>
  </SOAP:Body>
</SOAP:Envelope>`;

    return this.call('RemoveRolesFromUser', {}, 'http://schemas.cordys.com/UserManagement/1.0/Organization', soapXml);
  }

  /**
   * Fetch all roles assigned to a user in Cordys.
   */
  getUserRoles(userName: string): Promise<string[]> {
    if (this.useMockData) return Promise.resolve([]);

    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <GetRolesForUser xmlns="http://schemas.cordys.com/UserManagement/1.0/Organization">
      <User>
        <UserName>${userName}</UserName>
      </User>
    </GetRolesForUser>
  </SOAP:Body>
</SOAP:Envelope>`;

    return this.call('GetRolesForUser', {}, 'http://schemas.cordys.com/UserManagement/1.0/Organization', soapXml)
      .then(resp => {
        // Search for 'Role' at top level of response payload
        let roles = $.cordys.json.find(resp, 'Role');

        // If not found, look for '<Roles><Role>...</Role></Roles>' structure
        if (!roles) {
          const rolesContainer = $.cordys.json.find(resp, 'Roles');
          if (rolesContainer && rolesContainer.Role) {
            roles = rolesContainer.Role;
          }
        }

        if (!roles) return [];
        const roleArr = Array.isArray(roles) ? roles : [roles];
        return roleArr.map((r: any) => {
          if (typeof r === 'string') return r;
          // Extract the actual role name or DN from several possible fields
          return r['#text'] || r['name'] || r['@name'] || r['Description'] || '';
        }).filter(name => !!name);
      });
  }
  getUserRolesDetail(userName: string): Promise<string[]> {
    if (this.useMockData) return Promise.resolve([]);

    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <GetUserDetails xmlns="http://schemas.cordys.com/UserManagement/1.0/Organization">
      <User>
        <UserName>${userName}</UserName>
      </User>
    </GetUserDetails>
  </SOAP:Body>
</SOAP:Envelope>`;

    return this.call('GetUserDetails', {}, 'http://schemas.cordys.com/UserManagement/1.0/Organization', soapXml)
      .then(resp => {
        // Search for 'Role' at top level of response payload
        let roles = $.cordys.json.find(resp, 'Role');

        // If not found, look for '<Roles><Role>...</Role></Roles>' structure
        if (!roles) {
          const rolesContainer = $.cordys.json.find(resp, 'Roles');
          if (rolesContainer && rolesContainer.Role) {
            roles = rolesContainer.Role;
          }
        }

        if (!roles) return [];
        const roleArr = Array.isArray(roles) ? roles : [roles];
        return roleArr.map((r: any) => {
          if (typeof r === 'string') return r;
          // Extract the actual role name or DN from several possible fields
          return r['#text'] || r['name'] || r['@name'] || r['Description'] || '';
        }).filter(name => !!name);
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

  getAllCandidates(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES);
    // Use the exact SOAP structure provided by the user
    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
<SOAP:Body>
<GetAllCandidates xmlns="http://schemas.cordys.com/RMST1DatabaseMetadata" preserveSpace="no" qAccess="0" qValues="" />
</SOAP:Body>
</SOAP:Envelope>`;
    return this.call('GetAllCandidates', {}, 'http://schemas.cordys.com/RMST1DatabaseMetadata', soapXml)
      .then(resp => this.parseTuples(resp, 'ts_candidates'));
  }

  getAllCandidatesCount(): Promise<number> {
    if (this.useMockData) return Promise.resolve(MOCK_CANDIDATES.length);
    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <GetAllCandidatesCount xmlns="http://schemas.cordys.com/RMST1DatabaseMetadata" preserveSpace="no" qAccess="0" qValues="" />
  </SOAP:Body>
</SOAP:Envelope>`;
    return this.call('GetAllCandidatesCount', {}, 'http://schemas.cordys.com/RMST1DatabaseMetadata', soapXml)
      .then(resp => {
        const rows = this.parseTuples(resp);
        if (rows && rows.length > 0) {
          // Robustly find the count value (checks common Cordys field names)
          const countVal = rows[0]['count'] || rows[0]['COUNT'] || rows[0]['candidate_count'] || '0';
          return parseInt(typeof countVal === 'string' ? countVal : (countVal['#text'] || '0'));
        }
        return 0;
      });
  }

  getAllJobsCount(): Promise<number> {
    if (this.useMockData) return Promise.resolve(MOCK_JOB_REQUISITIONS.length);
    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <GetAllJobsCount xmlns="http://schemas.cordys.com/RMST1DatabaseMetadata" preserveSpace="no" qAccess="0" qValues="" />
  </SOAP:Body>
</SOAP:Envelope>`;
    return this.call('GetAllJobsCount', {}, 'http://schemas.cordys.com/RMST1DatabaseMetadata', soapXml)
      .then(resp => {
        const rows = this.parseTuples(resp);
        if (rows && rows.length > 0) {
          const countVal = rows[0]['count'] || rows[0]['COUNT'] || rows[0]['job_count'] || '0';
          return parseInt(typeof countVal === 'string' ? countVal : (countVal['#text'] || '0'));
        }
        return 0;
      });
  }

  getAllInterviewsCount(): Promise<number> {
    if (this.useMockData) return Promise.resolve(18); // Default mock value
    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <GetAllInterviewsCount xmlns="http://schemas.cordys.com/RMST1DatabaseMetadata" preserveSpace="no" qAccess="0" qValues="" />
  </SOAP:Body>
</SOAP:Envelope>`;
    return this.call('GetAllInterviewsCount', {}, 'http://schemas.cordys.com/RMST1DatabaseMetadata', soapXml)
      .then(resp => {
        const rows = this.parseTuples(resp);
        if (rows && rows.length > 0) {
          const countVal = rows[0]['count'] || rows[0]['COUNT'] || rows[0]['interview_count'] || '0';
          return parseInt(typeof countVal === 'string' ? countVal : (countVal['#text'] || '0'));
        }
        return 0;
      });
  }

  getRecentActivities(): Promise<Record<string, string>[]> {
    if (this.useMockData) return Promise.resolve([]);
    const soapXml = `<SOAP:Envelope xmlns:SOAP="http://schemas.xmlsoap.org/soap/envelope/">
  <SOAP:Body>
    <GetRecentActivities xmlns="http://schemas.cordys.com/RMST1DatabaseMetadata" preserveSpace="no" qAccess="0" qValues="" />
  </SOAP:Body>
</SOAP:Envelope>`;
    return this.call('GetRecentActivities', {}, 'http://schemas.cordys.com/RMST1DatabaseMetadata', soapXml)
      .then(resp => this.parseTuples(resp));
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
    // ─── New JSONB fields (stringified JSON arrays) ───
    education_details?: string;
    experience_details?: string;
    internship_details?: string;
    project_details?: string;
    certification_details?: string;
    // ─── New scalar fields ────────────────────────────
    cover_letter?: string;
    summary?: string;
    current_salary?: string;
    expected_salary?: string;
    notice_period?: string;
    total_experience?: string;
    highest_qualification?: string;
    resume_url?: string;
    portfolio_url?: string;
    github_url?: string;
    linkedin_url?: string;
    willing_to_relocate?: string;
    available_joining_date?: string;
  }): Promise<any> {
    if (this.useMockData) return Promise.resolve({ success: true });
    return this.call('UpdateTs_applications', {
      tuple: {
        'new': {
          ts_applications: {
            candidate_id: data.candidate_id,
            requisition_id: data.requisition_id,
            source: data.source,
            // referred_by intentionally omitted — it's an optional FK, must be NULL not ''
            current_stage_id: data.current_stage_id,
            status: 'ACTIVE',
            notes: data.notes,
            applied_at: new Date().toISOString(),
            // ─── JSONB columns (stringified JSON) ────
            education_details: data.education_details || '',
            experience_details: data.experience_details || '',
            internship_details: data.internship_details || '',
            project_details: data.project_details || '',
            certification_details: data.certification_details || '',
            // ─── Scalar columns ──────────────────────
            cover_letter: data.cover_letter || '',
            summary: data.summary || '',
            current_salary: data.current_salary || '',
            expected_salary: data.expected_salary || '',
            notice_period: data.notice_period || '',
            total_experience: data.total_experience || '',
            highest_qualification: data.highest_qualification || '',
            resume_url: data.resume_url || '',
            portfolio_url: data.portfolio_url || '',
            github_url: data.github_url || '',
            linkedin_url: data.linkedin_url || '',
            willing_to_relocate: data.willing_to_relocate || 'false',
            available_joining_date: data.available_joining_date || '',
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
            created_at: oldData['created_at'] || '',
            created_by: oldData['created_by'] || '',
            updated_at: oldData['updated_at'] || '',
            updated_by: oldData['updated_by'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || '',
            education_details: oldData['education_details'] || '',
            experience_details: oldData['experience_details'] || '',
            internship_details: oldData['internship_details'] || '',
            project_details: oldData['project_details'] || '',
            certification_details: oldData['certification_details'] || '',
            cover_letter: oldData['cover_letter'] || '',
            summary: oldData['summary'] || '',
            current_salary: oldData['current_salary'] || '',
            expected_salary: oldData['expected_salary'] || '',
            notice_period: oldData['notice_period'] || '',
            total_experience: oldData['total_experience'] || '',
            highest_qualification: oldData['highest_qualification'] || '',
            resume_url: oldData['resume_url'] || '',
            portfolio_url: oldData['portfolio_url'] || '',
            github_url: oldData['github_url'] || '',
            linkedin_url: oldData['linkedin_url'] || '',
            willing_to_relocate: oldData['willing_to_relocate'] || '',
            available_joining_date: oldData['available_joining_date'] || ''
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
            created_at: oldData['created_at'] || '',
            created_by: oldData['created_by'] || '',
            updated_at: oldData['updated_at'] || '',
            updated_by: oldData['updated_by'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || '',
            education_details: oldData['education_details'] || '',
            experience_details: oldData['experience_details'] || '',
            internship_details: oldData['internship_details'] || '',
            project_details: oldData['project_details'] || '',
            certification_details: oldData['certification_details'] || '',
            cover_letter: oldData['cover_letter'] || '',
            summary: oldData['summary'] || '',
            current_salary: oldData['current_salary'] || '',
            expected_salary: oldData['expected_salary'] || '',
            notice_period: oldData['notice_period'] || '',
            total_experience: oldData['total_experience'] || '',
            highest_qualification: oldData['highest_qualification'] || '',
            resume_url: oldData['resume_url'] || '',
            portfolio_url: oldData['portfolio_url'] || '',
            github_url: oldData['github_url'] || '',
            linkedin_url: oldData['linkedin_url'] || '',
            willing_to_relocate: oldData['willing_to_relocate'] || '',
            available_joining_date: oldData['available_joining_date'] || ''
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
            created_at: oldData['created_at'] || '',
            created_by: oldData['created_by'] || '',
            updated_at: oldData['updated_at'] || '',
            updated_by: oldData['updated_by'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || '',
            education_details: oldData['education_details'] || '',
            experience_details: oldData['experience_details'] || '',
            internship_details: oldData['internship_details'] || '',
            project_details: oldData['project_details'] || '',
            certification_details: oldData['certification_details'] || '',
            cover_letter: oldData['cover_letter'] || '',
            summary: oldData['summary'] || '',
            current_salary: oldData['current_salary'] || '',
            expected_salary: oldData['expected_salary'] || '',
            notice_period: oldData['notice_period'] || '',
            total_experience: oldData['total_experience'] || '',
            highest_qualification: oldData['highest_qualification'] || '',
            resume_url: oldData['resume_url'] || '',
            portfolio_url: oldData['portfolio_url'] || '',
            github_url: oldData['github_url'] || '',
            linkedin_url: oldData['linkedin_url'] || '',
            willing_to_relocate: oldData['willing_to_relocate'] || '',
            available_joining_date: oldData['available_joining_date'] || ''
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
            created_at: oldData['created_at'] || '',
            created_by: oldData['created_by'] || '',
            updated_at: oldData['updated_at'] || '',
            updated_by: oldData['updated_by'] || '',
            temp1: oldData['temp1'] || '',
            temp2: oldData['temp2'] || '',
            temp3: oldData['temp3'] || '',
            temp4: oldData['temp4'] || '',
            temp5: oldData['temp5'] || '',
            education_details: oldData['education_details'] || '',
            experience_details: oldData['experience_details'] || '',
            internship_details: oldData['internship_details'] || '',
            project_details: oldData['project_details'] || '',
            certification_details: oldData['certification_details'] || '',
            cover_letter: oldData['cover_letter'] || '',
            summary: oldData['summary'] || '',
            current_salary: oldData['current_salary'] || '',
            expected_salary: oldData['expected_salary'] || '',
            notice_period: oldData['notice_period'] || '',
            total_experience: oldData['total_experience'] || '',
            highest_qualification: oldData['highest_qualification'] || '',
            resume_url: oldData['resume_url'] || '',
            portfolio_url: oldData['portfolio_url'] || '',
            github_url: oldData['github_url'] || '',
            linkedin_url: oldData['linkedin_url'] || '',
            willing_to_relocate: oldData['willing_to_relocate'] || '',
            available_joining_date: oldData['available_joining_date'] || ''
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

