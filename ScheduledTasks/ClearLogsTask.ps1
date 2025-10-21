# Ubicación recomendado de este archivo "G:\Scato\ScheduledTasks\ClearLogsTask.ps1"
# Configuración de paths y días de retención
$logEntries = @(
    @{ Path = "C:\ScatoLogs"; Days = 30 },
    @{ Path = "L:\ScatoLogs"; Days = 30 },
    @{ Path = "C:\inetpub\logs\LogFiles"; Days = 15 },
	@{ Path = "L:\inetpub\logs\LogFiles"; Days = 10 },
	@{ Path = "L:\ClearLogsTask\LogFiles"; Days = 3 }
)

# Ruta para log de ejecución
$logFolder = "L:\ClearLogsTask\LogFiles"
if (!(Test-Path -Path $logFolder)) {
	New-Item -ItemType Directory -Path $logFolder -Force | Out-Null
}
$logFile = Join-Path $logFolder ("ClearLogsTask_{0}.log" -f (Get-Date -Format 'yyyy-MM-dd'))

# Función para registrar mensajes
function Write-Log {
    param([string]$message)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    "$timestamp - $message" | Out-File -FilePath $logFile -Append -Encoding Default
}

# Función para limpiar archivos viejos
function Clean-OldFiles {
    param(
        [string]$path,
        [int]$days
    )
    if (Test-Path $path) {
        Write-Log "Limpieza iniciada en $path (retención: $days días)"
        try {
            $files = Get-ChildItem -Path $path -File -Recurse -ErrorAction SilentlyContinue
            $limit = (Get-Date).AddDays(-$days)
            $oldFiles = $files | Where-Object { $_.LastWriteTime -lt $limit }

            $count = 0
            foreach ($file in $oldFiles) {
                try {
                    Remove-Item $file.FullName -Force -ErrorAction Stop
                    $count++
					Write-Log "  Archivo eliminado: $($file.FullName)"
                } catch {
                    Write-Log "  Error al borrar: $($file.FullName) - $($_.Exception.Message)"
                }
            }

            Write-Log "  Archivos eliminados: $count"
        } catch {
            Write-Log "  Error al acceder a $path - $($_.Exception.Message)"
        }
    } else {
        Write-Log "Carpeta no encontrada: $path"
    }
}

# Iniciar ejecución
Write-Log "========== Tarea de limpieza iniciada =========="

foreach ($entry in $logEntries) {
    Clean-OldFiles -path $entry.Path -days $entry.Days
}

Write-Log "========== Tarea de limpieza finalizada ==========`n"
