create extension if not exists pg_cron with schema pg_catalog;

do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job
  from cron.job
  where jobname = 'padelku-backend-maintenance';

  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;

  perform cron.schedule(
    'padelku-backend-maintenance',
    '* * * * *',
    'select public.run_backend_maintenance(100);'
  );
end;
$$;
