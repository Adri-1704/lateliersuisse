-- Ajoute le numéro de client Aligro (optionnel) sur le compte marchand,
-- afin que l'admin (Adrien) puisse le vérifier auprès d'Aligro.
-- Le rattachement resto se fait via restaurants.merchant_id -> merchants.id ;
-- ce champ vit donc logiquement sur merchants (un compte marchand = un client Aligro).
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS aligro_customer_number text;

COMMENT ON COLUMN merchants.aligro_customer_number IS
  'Numéro de client Aligro renseigné par le restaurateur, à vérifier manuellement par l''admin auprès d''Aligro.';
