select * from users where id='019e1121-9653-787d-a745-4e27843dbb14';
select * from users where id='019e1121-9653-787d-a745-4e27843dbb14';
select ur.*, r.name from user_roles ur
left join roles r on r.id=ur.role_id 
where ur.user_id='019e1121-9653-787d-a745-4e27843dbb14';
select * from users;
delete from registration_challenges where email='rijiye1905@anawebs.com';
select * from registration_challenges;

select * from roles where key ='independent_farmer';
select * from role_permission where role_id='019e111b-ff91-7ddf-a05e-148c385a7568';
select * from user_plot;
update users
set subscription_tier='promax'
where id='019e111b-ffe3-7c29-b6e8-e609c9829566';

select * from gaia_queries;
select * from plots;
select * from user_roles;