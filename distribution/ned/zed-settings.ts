import { z } from 'zod';
import { parse, type ParseError } from 'jsonc-parser';
// Required fields of settings_content/{agent,language_model}.rs in the pinned Zed v1.28.1.
// Do not treat successful JSON parsing or model transport tests as Zed settings acceptance.
const profile=z.object({name:z.string().min(1),tools:z.record(z.boolean()).optional(),enable_all_context_servers:z.boolean().optional(),context_servers:z.record(z.unknown()).optional()}).passthrough();
const model=z.object({name:z.string().min(1),max_tokens:z.number().int().positive(),capabilities:z.object({tools:z.boolean(),images:z.boolean(),parallel_tool_calls:z.boolean(),prompt_cache_key:z.boolean(),chat_completions:z.boolean(),interleaved_reasoning:z.boolean(),max_tokens_parameter:z.boolean()}).passthrough()}).passthrough();
const settings=z.object({agent:z.object({profiles:z.record(profile).optional()}).passthrough(),language_models:z.object({openai_compatible:z.record(z.object({api_url:z.string().url(),available_models:z.array(model).min(1)}).passthrough())}).passthrough().optional()}).passthrough();
export function validateManagedZedSettings(text:string) {
  const errors:ParseError[]=[];const data=parse(text.replace(/^\ufeff/,''),errors,{allowTrailingComma:true});
  if(errors.length)throw Error('Zed 설정 JSONC 형식 오류. 기존 설정은 보존했습니다.');
  const result=settings.safeParse(data);
  if(!result.success)throw Error('ZED_SETTINGS_SCHEMA: '+result.error.issues.slice(0,5).map(i=>i.path.join('.')).join(', '));
}
