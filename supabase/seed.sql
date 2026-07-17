-- Seed inicial: primer inflable real del catálogo.
-- Ya aplicado en producción; idempotente por el on conflict.

insert into public.inflatables
  (slug, name, description, length_m, width_m, height_m, price_clp, age_range, capacity, power_required, active)
values (
  'castillo-combo-tobogan',
  'Castillo Combo con Tobogán',
  'El clásico que nunca falla: castillo inflable con área de salto y tobogán integrado. Ideal para cumpleaños en el patio — los niños entran, saltan, se deslizan y vuelven a empezar. Incluye motor soplador e instalación.',
  5.0, 3.5, 3.0,
  35000,
  '2 a 10 años',
  'hasta 6 niños',
  true, true
)
on conflict (slug) do nothing;
