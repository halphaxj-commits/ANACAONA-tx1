-- SCOUT HUB V30 security hardening: privileged SECURITY DEFINER RPCs are never callable by anon.
revoke execute on function public.award_lesson_completion_v17(uuid,text,text) from anon;
revoke execute on function public.award_lesson_skill_v17(text,text) from anon;
revoke execute on function public.can_modify_app() from anon;
revoke execute on function public.creator_grant_editor(uuid) from anon;
revoke execute on function public.creator_issue_role_code(text,text,integer,timestamptz) from anon;
revoke execute on function public.creator_list_role_codes() from anon;
revoke execute on function public.creator_revoke_editor(uuid) from anon;
revoke execute on function public.grant_app_editor(uuid) from anon;
revoke execute on function public.is_app_editor() from anon;
revoke execute on function public.prevent_direct_access_role_change() from anon;
revoke execute on function public.prevent_direct_unit_role_change() from anon;
revoke execute on function public.revoke_app_editor(uuid) from anon;
notify pgrst, 'reload schema';
