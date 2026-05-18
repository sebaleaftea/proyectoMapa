import { useNavigate } from 'react-router-dom'
import { useReportForm } from './useReportForm'
import { ReportForm } from './ReportForm'
import { ReportFeedback } from './ReportFeedback'

export function ReportPage() {
  const navigate = useNavigate()
  const {
    fileRef,
    photoPreview,
    category,
    description,
    setDescription,
    submitState,
    coords,
    setCoords,
    errors,
    earnedPoints,
    hasCamera,
    cameraPermission,
    isCameraOpen,
    setVideoRef,
    handlePhotoChange,
    handleDropPhoto,
    openCamera,
    capturePhoto,
    closeCamera,
    handleCategoryChange,
    handleSubmit,
    resetForm,
    retrySubmit,
  } = useReportForm()

  if (submitState === 'success' || submitState === 'warning' || submitState === 'error') {
    return (
      <ReportFeedback
        submitState={submitState}
        earnedPoints={earnedPoints}
        category={category}
        onNavigateToMap={() => navigate('/mapa')}
        onRetry={retrySubmit}
        onReset={resetForm}
      />
    )
  }

  return (
    <ReportForm
      fileRef={fileRef}
      photoPreview={photoPreview}
      category={category}
      description={description}
      submitState={submitState}
      coords={coords}
      errors={errors}
      hasCamera={hasCamera}
      cameraPermission={cameraPermission}
      isCameraOpen={isCameraOpen}
      setVideoRef={setVideoRef}
      onPhotoChange={handlePhotoChange}
      onDropPhoto={handleDropPhoto}
      onCategoryChange={handleCategoryChange}
      onDescriptionChange={setDescription}
      onCoordsChange={setCoords}
      onSubmit={handleSubmit}
      onOpenCamera={openCamera}
      onCapturePhoto={capturePhoto}
      onCloseCamera={closeCamera}
    />
  )
}
