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

  getProfile(){ return this.request(''); }
  updateProfile(payload: unknown){ return this.request('', {method:'PATCH',headers:this.headers(),body:JSON.stringify(payload)}); }
  getCompletion(){ return this.request('/completion'); }
  saveFinancial(payload: unknown){ return this.request('/financial',{method:'PUT',headers:this.headers(),body:JSON.stringify(payload)}); }
  getFinancial(){ return this.request('/financial'); }
  listDocuments(){ return this.request('/documents'); }
  uploadDocument(documentType:string,file:File){
    const data=new FormData();data.append('documentType',documentType);data.append('file',file);
    return this.request('/documents',{method:'POST',headers:this.headers(false),body:data});
  }
  replaceDocument(id:string,file:File){const data=new FormData();data.append('file',file);return this.request(`/documents/${encodeURIComponent(id)}`,{method:'PUT',headers:this.headers(false),body:data});}
  deleteDocument(id:string){return this.request(`/documents/${encodeURIComponent(id)}`,{method:'DELETE',headers:this.headers(false)},false);}
  async previewDocument(id:string){
    const response=await fetch(`${this.baseUrl}/documents/${encodeURIComponent(id)}/content`,{headers:this.headers(false)});
    if(!response.ok)throw new Error('Could not open this document.');
    return URL.createObjectURL(await response.blob());
  }
  submit(){return this.request('/submit',{method:'POST',headers:this.headers(),body:'{}'});}

  private async request(path:string,options:RequestInit={},expectJson=true):Promise<any>{
    const response=await fetch(`${this.baseUrl}${path}`,{...options,headers:options.headers||this.headers()});
    const body=expectJson?await response.json().catch(()=>null):null;
    if(!response.ok)throw new Error(body?.message||'The profile request could not be completed.');
    return body;
  }
}
