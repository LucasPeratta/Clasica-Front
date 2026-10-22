import { Alert, Grid, Snackbar, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/es";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import NotesIcon from "@mui/icons-material/Notes";
import { LoadingScreen } from "../../LoadingScreen";
import { usePaxForm } from "../hooks/usePaxForm";
import { FormSection } from "../../common/FormSection";
import { FormActions, FormHeader, FormPage } from "../../common/FormLayout";
import { iPax } from "../model";

type DateField = "dob" | "dniVto" | "passportVto";

export const PaxForm = () => {
  const { id, loading, saving, saved, setSaved, formData, setField, errors, saveError, setSaveError, handleSubmit, goBack } =
    usePaxForm();

  if (loading) return <LoadingScreen />;

  const fullName = `${formData.firstname ?? ""} ${formData.lastname ?? ""}`.trim();

  const text = (field: keyof iPax, label: string, maxLength: number, extra: object = {}) => (
    <TextField
      label={label}
      fullWidth
      value={(formData[field] as string) ?? ""}
      onChange={(e) => setField(field, e.target.value as never)}
      inputProps={{ maxLength }}
      error={!!errors[field as keyof typeof errors]}
      helperText={errors[field as keyof typeof errors]}
      {...extra}
    />
  );

  const date = (field: DateField, label: string, helperText?: string) => (
    <DatePicker
      label={label}
      format="DD/MM/YYYY"
      value={formData[field] ? dayjs(formData[field]) : null}
      onChange={(value) => setField(field, value ?? null)}
      slotProps={{ textField: { fullWidth: true, helperText } }}
    />
  );

  return (
    <FormPage>
      <FormHeader
        title={id ? `Editar a ${fullName || "pasajero"}` : "Cargar un pasajero"}
        description={
          id
            ? "Cambiá lo que necesites y apretá Guardar."
            : "Completá lo que tengas. Después vas a poder subir fotos del DNI o pasaporte."
        }
        onBack={goBack}
      />

      {saveError && (
        <Alert severity="error" onClose={() => setSaveError("")} sx={{ borderRadius: 3, fontSize: "1rem" }}>
          {saveError}
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
        <form id="pax-form" onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <FormSection title="Nombre" icon={<PersonIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {text("firstname", "Nombre *", 25, { autoFocus: !id })}
              </Grid>
              <Grid item xs={12} md={6}>
                {text("lastname", "Apellido *", 25)}
              </Grid>
            </Grid>
          </FormSection>

          <FormSection
            title="Documentos"
            icon={<BadgeIcon />}
            description="Con las fechas de vencimiento el sistema avisa si un documento no sirve para un viaje."
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {text("dni", "DNI", 10, { helperText: "Con o sin puntos, da igual" })}
              </Grid>
              <Grid item xs={12} md={6}>
                {date("dniVto", "Vencimiento del DNI")}
              </Grid>
              <Grid item xs={12} md={6}>
                {text("passport", "Pasaporte", 9, {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => setField("passport", e.target.value.toUpperCase()),
                })}
              </Grid>
              <Grid item xs={12} md={6}>
                {date("passportVto", "Vencimiento del pasaporte", "Tiene que seguir vigente 6 meses después del viaje")}
              </Grid>
            </Grid>
          </FormSection>

          <FormSection title="Contacto" icon={<ContactPhoneIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {text("phoneNumber", "Celular", 35)}
              </Grid>
              <Grid item xs={12} md={6}>
                {text("email", "Email", 35, { type: "email" })}
              </Grid>
              <Grid item xs={12}>
                {text("adress", "Dirección", 30)}
              </Grid>
            </Grid>
          </FormSection>

          <FormSection title="Otros datos" icon={<NotesIcon />}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {date("dob", "Fecha de nacimiento")}
              </Grid>
              <Grid item xs={12}>
                {text("obs", "Observaciones", 300, {
                  multiline: true,
                  rows: 3,
                  helperText: "Ej. preferencias, alergias, viajero frecuente...",
                })}
              </Grid>
            </Grid>
          </FormSection>

          <FormActions
            formId="pax-form"
            saveLabel={id ? "Guardar cambios" : "Guardar pasajero"}
            saving={saving}
            onCancel={goBack}
            note="Solo el nombre y el apellido son obligatorios."
          />
        </form>
      </LocalizationProvider>

      <Snackbar open={saved} autoHideDuration={3000} onClose={() => setSaved(false)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity="success" variant="filled" onClose={() => setSaved(false)}>
          {id ? "Cambios guardados" : "Pasajero guardado"}
        </Alert>
      </Snackbar>
    </FormPage>
  );
};
