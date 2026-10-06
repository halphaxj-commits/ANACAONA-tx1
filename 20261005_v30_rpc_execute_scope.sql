-- V30: privileged SECURITY DEFINER RPCs are scoped to signed-in users.
-- Revoke PUBLIC (which otherwise covers anon) and explicitly grant authenticated.
revoke execute on function public.award_lesson_completion_v17(uuid,text,text) from public, anon; grant execute on function public.award_lesson_completion_v17(uuid,text,text) to authenticated;
revoke execute on function public.award_lesson_skill_v17(text,text) from public, anon; grant execute on function public.award_lesson_skill_v17(text,text) to authenticated;
revoke execute on function public.can_modify_app() from public, anon; grant execute on function public.can_modify_app() to authenticated;
revoke execute on function public.creator_grant_editor(uuid) from public, anon; grant execute on function public.creator_grant_editor(uuid) to authenticated;
revoke execute on function public.creator_issue_role_code(text,text,integer,timestamptz) from public, anon; grant execute on function public.creator_issue_role_code(text,text,integer,timestamptz) to authenticated;
revoke execute on function public.creator_list_role_codes() from public, anon; grant execute on function public.creator_list_role_codes() to authenticated;
revoke execute on function public.creator_revoke_editor(uuid) from public, anon; grant execute on function public.creator_revoke_editor(uuid) to authenticated;
revoke execute on function public.grant_app_editor(uuid) from public, anon; grant execute on function public.grant_app_editor(uuid) to authenticated;
revoke execute on function public.is_app_editor() from public, anon; grant execute on function public.is_app_editor() to authenticated;
revoke execute on function public.prevent_direct_access_role_change() from public, anon; grant execute on function public.prevent_direct_access_role_change() to authenticated;
revoke execute on function public.prevent_direct_unit_role_change() from public, anon; grant execute on function public.prevent_direct_unit_role_change() to authenticated;
revoke execute on function public.revoke_app_editor(uuid) from public, anon; grant execute on function public.revoke_app_editor(uuid) to authenticated;
notify pgrst, 'reload schema';
