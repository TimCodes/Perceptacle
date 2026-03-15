{{/*
Expand the name of the chart.
*/}}
{{- define "perceptacle.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "perceptacle.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "perceptacle.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "perceptacle.labels" -}}
helm.sh/chart: {{ include "perceptacle.chart" . }}
{{ include "perceptacle.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/part-of: perceptacle
environment: {{ .Values.global.environment }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "perceptacle.selectorLabels" -}}
app.kubernetes.io/name: {{ include "perceptacle.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "perceptacle.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "perceptacle.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Return the proper image registry
*/}}
{{- define "perceptacle.imageRegistry" -}}
{{- .Values.global.imageRegistry | default "registry.digitalocean.com/perceptacle" }}
{{- end }}

{{/*
Return the proper image name for a service
*/}}
{{- define "perceptacle.image" -}}
{{- $registry := include "perceptacle.imageRegistry" .root -}}
{{- printf "%s/%s:%s" $registry .service.image.repository (.service.image.tag | default "latest") }}
{{- end }}

{{/*
Return the database URL
*/}}
{{- define "perceptacle.databaseUrl" -}}
{{- if .Values.externalDatabase.enabled }}
{{- /* External database URL should be set via secrets */ -}}
{{- else if .Values.postgresql.enabled }}
{{- printf "postgresql://%s:%s@%s-postgresql:%d/%s" .Values.postgresql.auth.username .Values.postgresql.auth.password (include "perceptacle.fullname" .) (int .Values.postgresql.service.port) .Values.postgresql.auth.database }}
{{- end }}
{{- end }}

{{/*
Common annotations for deployments
*/}}
{{- define "perceptacle.deploymentAnnotations" -}}
checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
{{- end }}

{{/*
Return the agents service URL
*/}}
{{- define "perceptacle.agentsServiceUrl" -}}
{{- printf "http://%s-agents:%d" (include "perceptacle.fullname" .) (int .Values.agents.service.port) }}
{{- end }}
