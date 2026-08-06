import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { retencionSchema } from '../../schemas/retencion.schema';
import { HiOutlineInformationCircle, HiOutlineUser, HiOutlineTruck, HiOutlineLocationMarker, HiOutlineSearch } from 'react-icons/hi';
import MapaSelector from './MapaSelector';
import CargaFotos from './CargaFotos';
import SelectorDeposito from './SelectorDeposito';

const FormularioNuevaRetencion = ({ onSubmit, loading, initialData = {} }) => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch,
    setValue,
    reset,
    getValues,
    control
  } = useForm({
    resolver: zodResolver(retencionSchema),
    defaultValues: initialData || {}
  });

  const { fields: personas, append: agregarPersona, remove: quitarPersona } = useFieldArray({
    control,
    name: 'personas_involucradas',
  });

  const [coords, setCoords] = useState({
    latitud: initialData?.latitud ?? undefined,
    longitud: initialData?.longitud ?? undefined
  });

  const [isSearching, setIsSearching] = useState(false);

  // Estados para croquis y acta (usando CargaFotos con su API real)
  const [croquisFotos, setCroquisFotos] = useState([]);
  const [actaFotos, setActaFotos] = useState([]);

  const formValues = watch();
  useEffect(() => {
    if (Object.keys(formValues).length > 0) {
      localStorage.setItem('sigevir_borrador_retencion', JSON.stringify(formValues));
    }
  }, [formValues]);

  const handleLocationChange = ({ lat, lng, direccion }) => {
    setCoords({ latitud: lat, longitud: lng });
    setValue('latitud', lat, { shouldValidate: true });
    setValue('longitud', lng, { shouldValidate: true });
    if (direccion) {
      setValue('lugar_retencion', direccion);
    }
  };

  const handleSearchAddress = async () => {
    const query = getValues('lugar_retencion');
    console.log('Buscar direccion:', query);
    if (!query || query.trim().length < 3) {
      alert('Por favor, ingrese al menos 3 caracteres para buscar la direccion.');
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      if (!res.ok) {
        const errText = await res.text();
        console.error('Geocode request error', res.status, errText);
        throw new Error('Geocode request failed');
      }
      const data = await res.json();
      console.log('Geocode response', data);
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        const { lat, lng } = result.geometry.location;
        const latNum = parseFloat(lat);
        const lngNum = parseFloat(lng);
        // actualizar mapa y direccion
        handleLocationChange({ lat: latNum, lng: lngNum, direccion: result.formatted_address });
      } else {
        alert('No se encontro la direccion exacta. Intente con mas detalles.');
      }
    } catch (err) {
      console.error(err);
      alert('Error al consultar la API de Google Maps. Verifique su conexion.');
    } finally {
      setIsSearching(false);
    }
  };

  const customSubmit = (data) => {
    onSubmit({
      ...data,
      latitud: coords.latitud ?? null,
      longitud: coords.longitud ?? null,
      // Pasar archivos de croquis y acta para que la pagina padre los maneje
      _croquisFotos: croquisFotos,
      _actaFotos: actaFotos,
    });
  };

  // Clases CSS reutilizadas del formulario existente
  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all";
  const inputErrorClass = "w-full px-4 py-2.5 rounded-xl border border-red-300 ring-1 ring-red-100 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all";

  return (
    <form id="form-retencion" onSubmit={handleSubmit(customSubmit)} className="space-y-8 pb-20">
      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 1: Datos del Vehiculo (existente, sin cambios)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineTruck className="w-6 h-6" />
          <h3 className="font-bold text-lg">Datos del Vehiculo</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Dominio / Patente</label>
            <input 
              {...register('dominio')}
              placeholder="Ej: ABC 123"
              className={`${errors.dominio ? inputErrorClass : inputClass} uppercase`}
            />
            {errors.dominio && <p className="text-xs text-red-500 font-medium">{errors.dominio.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Tipo de Vehiculo</label>
            <select 
              {...register('tipo_vehiculo')}
              className={`${inputClass} bg-white`}
            >
              <option value="AUTO">Automovil</option>
              <option value="MOTO">Motocicleta</option>
              <option value="CAMION">Camion</option>
              <option value="PICKUP">Camioneta / Pick-up</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Marca</label>
            <input 
              {...register('marca')}
              className={inputClass}
            />
            {errors.marca && <p className="text-xs text-red-500 font-medium">{errors.marca.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Modelo</label>
            <input 
              {...register('modelo')}
              className={inputClass}
            />
            {errors.modelo && <p className="text-xs text-red-500 font-medium">{errors.modelo.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Color</label>
            <input 
              {...register('color')}
              className={inputClass}
            />
            {errors.color && <p className="text-xs text-red-500 font-medium">{errors.color.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nro. de Motor</label>
            <input 
              {...register('nro_motor')}
              className={inputClass}
            />
            {errors.nro_motor && <p className="text-xs text-red-500 font-medium">{errors.nro_motor.message}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nro. de Cuadro / Chasis</label>
            <input 
              {...register('nro_cuadro')}
              className={inputClass}
            />
            {errors.nro_cuadro && <p className="text-xs text-red-500 font-medium">{errors.nro_cuadro.message}</p>}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 2: Datos del Titular / Infractor (existente, sin cambios)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineUser className="w-6 h-6" />
          <h3 className="font-bold text-lg">Datos del Titular / Infractor</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Nombre Completo</label>
            <input 
              {...register('titular_nombre')}
              className={inputClass}
            />
            {errors.titular_nombre && <p className="text-xs text-red-500 font-medium">{errors.titular_nombre.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">DNI / CUIT</label>
              <input 
                {...register('titular_dni')}
                placeholder="Sin puntos"
                className={inputClass}
              />
              {errors.titular_dni && <p className="text-xs text-red-500 font-medium">{errors.titular_dni.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Domicilio</label>
              <input 
                {...register('titular_domicilio')}
                className={inputClass}
              />
              {errors.titular_domicilio && <p className="text-xs text-red-500 font-medium">{errors.titular_domicilio.message}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 3: Informacion de la Retencion (existente, sin cambios)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineLocationMarker className="w-6 h-6" />
          <h3 className="font-bold text-lg">Informacion de la Retencion</h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Lugar de Retencion</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                {...register('lugar_retencion')}
                placeholder="Calle, interseccion o coordenadas"
                className={`flex-1 ${inputClass}`}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchAddress(); } }}
              />
              <button
                type="button"
                onClick={handleSearchAddress}
                disabled={isSearching}
                className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <HiOutlineSearch className="w-4 h-4" />
                )}
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {errors.lugar_retencion && <p className="text-xs text-red-500 font-medium">{errors.lugar_retencion.message}</p>}
          </div>

          <MapaSelector
            onLocationChange={handleLocationChange}
            initialPosition={
              coords.latitud ? { lat: coords.latitud, lng: coords.longitud } : null
            }
          />
          {/* Direccion seleccionada */}
          {watch('lugar_retencion') && (
            <p className="mt-2 text-sm text-gray-700">
              <span className="font-medium">Direccion seleccionada:</span> {watch('lugar_retencion')}
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Motivo de Retencion</label>
            <textarea 
              {...register('motivo_retencion')}
              rows={3}
              placeholder="Ej: Falta de seguro, licencia vencida, alcoholemia positiva..."
              className={inputClass}
            />
            {errors.motivo_retencion && <p className="text-xs text-red-500 font-medium">{errors.motivo_retencion.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Observaciones Generales (Opcional)</label>
            <textarea 
              {...register('observaciones')}
              rows={2}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 4: Datos del procedimiento (NUEVA)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <HiOutlineInformationCircle className="w-6 h-6" />
          <h3 className="font-bold text-lg">Datos del Procedimiento</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">N° de comision</label>
            <input {...register('numero_comision')} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">N° de movil policial</label>
            <input {...register('numero_movil')} className={inputClass} />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Colaboracion especial recibida</label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {['BOMBEROS', 'DIV_CANES', 'INFANTERIA', 'SEOM', 'CABALLERIA', 'DEFENSA_CIVIL', 'OTRO'].map(op => (
              <label key={op} className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  value={op}
                  checked={(watch('colaboracion_especial') || []).includes(op)}
                  onChange={(e) => {
                    const actual = getValues('colaboracion_especial') || [];
                    const nuevo = e.target.checked
                      ? [...actual, op]
                      : actual.filter(x => x !== op);
                    setValue('colaboracion_especial', nuevo);
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {op.replace(/_/g, ' ')}
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-700">Coopera Policia Judicial?</label>
          <label className="flex items-center gap-1.5 text-sm">
            <input type="radio" value="true" {...register('coopera_policia_judicial')} className="text-blue-600 focus:ring-blue-500" /> Si
          </label>
          <label className="flex items-center gap-1.5 text-sm">
            <input type="radio" value="false" {...register('coopera_policia_judicial')} className="text-blue-600 focus:ring-blue-500" /> No
          </label>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 5: Personas involucradas (NUEVA - repeater dinamico)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-600">
            <HiOutlineUser className="w-6 h-6" />
            <h3 className="font-bold text-lg">Personas Involucradas</h3>
          </div>
          <button
            type="button"
            onClick={() => agregarPersona({ rol: 'CONDUCTOR', nombre_completo: '', es_lesionado: false })}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
          >
            + Agregar persona
          </button>
        </div>

        {personas.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <HiOutlineUser className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm font-medium">Sin personas cargadas todavia.</p>
            <p className="text-xs text-gray-300 mt-1">Presiona "Agregar persona" para empezar.</p>
          </div>
        )}

        {personas.map((persona, index) => (
          <div key={persona.id} className="border border-gray-200 rounded-2xl p-5 space-y-4 relative bg-gray-50/50">
            <button
              type="button"
              onClick={() => quitarPersona(index)}
              className="absolute top-4 right-4 text-red-500 text-sm font-semibold hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
            >
              Quitar
            </button>

            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Persona {index + 1}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Rol</label>
                <select {...register(`personas_involucradas.${index}.rol`)} className={`${inputClass} bg-white`}>
                  <option value="CONDUCTOR">Conductor</option>
                  <option value="ACOMPANANTE">Acompanante</option>
                  <option value="PEATON">Peaton</option>
                  <option value="TESTIGO">Testigo</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Nombre completo</label>
                <input {...register(`personas_involucradas.${index}.nombre_completo`)} className={inputClass} />
                {errors.personas_involucradas?.[index]?.nombre_completo && (
                  <p className="text-xs text-red-500 font-medium">{errors.personas_involucradas[index].nombre_completo.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Edad</label>
                <input type="number" {...register(`personas_involucradas.${index}.edad`, { valueAsNumber: true })} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">DNI</label>
                <input {...register(`personas_involucradas.${index}.dni`)} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Domicilio</label>
                <input {...register(`personas_involucradas.${index}.domicilio`)} className={inputClass} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Telefono</label>
                <input {...register(`personas_involucradas.${index}.telefono`)} className={inputClass} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" {...register(`personas_involucradas.${index}.es_lesionado`)} className="rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
              <label className="text-sm font-semibold text-gray-700">Es lesionado</label>
            </div>

            {watch(`personas_involucradas.${index}.es_lesionado`) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-amber-200 bg-amber-50/50 rounded-r-xl p-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Tipo de lesion</label>
                  <input {...register(`personas_involucradas.${index}.tipo_lesion`)} className={inputClass} />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600">Nosocomio de traslado</label>
                  <input {...register(`personas_involucradas.${index}.nosocomio_traslado`)} className={inputClass} />
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 6: Consigna en el lugar (NUEVA)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-blue-600">Consigna en el Lugar</h3>
        <div className="flex items-center gap-2">
          <input type="checkbox" {...register('queda_consigna')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          <label className="text-sm font-semibold text-gray-700">Queda personal de consigna en el lugar</label>
        </div>

        {watch('queda_consigna') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200 bg-blue-50/50 rounded-r-xl p-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Nombre</label>
              <input {...register('consigna_nombre')} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Cargo/Jerarquia</label>
              <input {...register('consigna_cargo')} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Dependencia</label>
              <input {...register('consigna_dependencia')} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Telefono</label>
              <input {...register('consigna_telefono')} className={inputClass} />
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 7: Traslado del vehiculo (NUEVA)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-blue-600">Traslado del Vehiculo</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex items-center gap-2 text-sm bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="radio" value="PROPIOS_MEDIOS" {...register('tipo_traslado')} className="text-blue-600 focus:ring-blue-500" />
            Se traslada por sus propios medios
          </label>
          <label className="flex items-center gap-2 text-sm bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="radio" value="GRUA" {...register('tipo_traslado')} className="text-blue-600 focus:ring-blue-500" />
            Se traslada en grua al deposito
          </label>
        </div>

        {watch('tipo_traslado') === 'GRUA' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-blue-200 bg-blue-50/50 rounded-r-xl p-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Dominio de la grua</label>
              <input {...register('grua_dominio')} className={inputClass} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Empresa</label>
              <input {...register('grua_empresa')} className={inputClass} />
            </div>
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 8: Declaracion en unidad judicial (NUEVA)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-blue-600">Declaracion en Unidad Judicial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Hora del hecho</label>
            <input type="datetime-local" {...register('hora_hecho')} className={inputClass} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">N° de hecho</label>
            <input {...register('numero_hecho')} className={inputClass} />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Mecanica del hecho</label>
          <textarea
            {...register('mecanica_hecho')}
            rows={3}
            placeholder="Descripcion aproximada de lo ocurrido segun dichos de testigos o involucrados"
            className={inputClass}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 9: Entorno del lugar (NUEVA)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-blue-600">Entorno del Lugar</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <label className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" {...register('tiene_camaras_privadas')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Camaras/domos privados cerca
          </label>
          <label className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" {...register('tiene_carteles_nomenclatura')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Carteles y nomenclatura visibles
          </label>
          <label className="flex items-center gap-2 text-sm bg-gray-50 px-3 py-2.5 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer">
            <input type="checkbox" {...register('tiene_reductores_velocidad')} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Reductores de velocidad
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Iluminacion</label>
            <select {...register('estado_iluminacion')} className={`${inputClass} bg-white`}>
              <option value="">-- Seleccionar --</option>
              <option value="BUENA">Buena</option>
              <option value="REGULAR">Regular</option>
              <option value="MALA">Mala</option>
              <option value="SIN_ILUMINACION">Sin iluminacion</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Estado de la calzada</label>
            <select {...register('estado_calzada')} className={`${inputClass} bg-white`}>
              <option value="">-- Seleccionar --</option>
              <option value="SECA">Seca</option>
              <option value="MOJADA">Mojada</option>
              <option value="DETERIORADA">Deteriorada</option>
              <option value="EN_OBRA">En obra</option>
            </select>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCION 10: Documentacion adicional (NUEVA)
         ═══════════════════════════════════════════════════════════════════ */}
      <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <h3 className="font-bold text-lg text-blue-600">Documentacion Adicional</h3>
        
        <div className="space-y-3">
          <label className="text-sm font-semibold text-gray-700">Croquis del hecho (foto)</label>
          <CargaFotos
            fotos={croquisFotos}
            setFotos={setCroquisFotos}
            maxFotos={1}
            minFotos={0}
          />
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="text-sm font-semibold text-gray-700">Acta de inspeccion ocular</label>
          <CargaFotos
            fotos={actaFotos}
            setFotos={setActaFotos}
            maxFotos={1}
            minFotos={0}
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          NOTA de borrador (existente, sin cambios)
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
        <HiOutlineInformationCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed">
          Los datos ingresados estan siendo guardados automaticamente como borrador localmente. 
          Podras recuperar el formulario si cierras la ventana antes de finalizar.
        </p>
      </div>
    </form>
  );
};

export default FormularioNuevaRetencion;
