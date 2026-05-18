// Utilidad para obtener clases de color según el modo oscuro/claro
import { useThemeStore } from '../store/themeStore'

export function useThemeClasses() {
  const isDark = useThemeStore((state) => state.isDark)

  return {
    modalBg: isDark ? 'bg-gray-900' : 'bg-white',
    overlay: isDark ? 'bg-black/70' : 'bg-black/50',
    border: isDark ? 'border-gray-700' : 'border-gray-200',
    headerText: isDark ? 'text-gray-100' : 'text-gray-900',
    sectionBg: isDark ? 'bg-gray-800' : 'bg-gray-50',
    sectionText: isDark ? 'text-gray-200' : 'text-gray-700',
    buttonConfirm: isDark
      ? 'bg-green-600 text-white hover:bg-green-700'
      : 'bg-green-500 text-white',
    buttonDeny: isDark
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-red-500 text-white',
    buttonNeutral: isDark
      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    input: isDark
      ? 'bg-gray-900 border-gray-700 text-gray-100 focus:ring-blue-400'
      : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500',
    skeleton: isDark ? 'bg-gray-700' : 'bg-gray-200',
    comment: isDark ? 'text-gray-300' : 'text-gray-600',
    commentUser: isDark ? 'text-gray-200' : 'text-gray-700',
    commentDate: isDark ? 'text-gray-400' : 'text-gray-500',
    error: isDark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-700',
    success: isDark ? 'bg-green-900 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800',
  }
}
