import { Injectable } from '@angular/core';

export interface StudentDocument {
  id: string;
  documentType: string;
  fileName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

@Injectable({ providedIn: 'root' })
export class StudentProfileApiService {
  private readonly baseUrl = ((window as Window & { SUPER_OFFER_API_URL?: string }).SUPER_OFFER_API_URL || '/api/v1') + '/student/profile';
  private token() { return localStorage.getItem('superoffer_access_token') || sessionStorage.getItem('superoffer_access_token') || ''; }
  private headers(json = true) { return { ...(json ? {'content-type':'application/json'} : {}), authorization:`Bearer ${this.token()}` }; }

  private profile: any = {};
  getProfile(): Promise<any>{ return Promise.resolve(this.profile); }
  updateProfile(payload: unknown): Promise<any>{ this.profile={...this.profile,...(payload as object)}; return Promise.resolve(this.profile); }
  getCompletion(){ return Promise.resolve({completionPercent:72}); }
  saveFinancial(payload: unknown){ this.profile={...this.profile,financial:payload}; return Promise.resolve(payload); }
  getFinancial(){ return Promise.resolve(this.profile['financial']||{}); }
  listDocuments(){ return Promise.resolve([]); }
  uploadDocument(documentType:string,file:File){
    const data=new FormData();data.append('documentType',documentType);data.append('file',file);
    return Promise.resolve({id:`demo-${Date.now()}`,documentType,fileName:file.name,mimeType:file.type,size:file.size,uploadedAt:new Date().toISOString()});
  }
  replaceDocument(id:string,file:File):Promise<StudentDocument>{return Promise.resolve({id,documentType:'document',fileName:file.name,mimeType:file.type,size:file.size,uploadedAt:new Date().toISOString()});}
  deleteDocument(id:string){return Promise.resolve({id});}
  async previewDocument(id:string){
    return '';
  }
  submit(){return Promise.resolve({status:'submitted'});}

  private async request(path:string,options:RequestInit={},expectJson=true):Promise<any>{
    const response=await fetch(`${this.baseUrl}${path}`,{...options,headers:options.headers||this.headers()});
    const body=expectJson?await response.json().catch(()=>null):null;
    if(!response.ok)throw new Error(body?.message||'The profile request could not be completed.');
    return body;
  }
}
