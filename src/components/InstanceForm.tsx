import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
  Textarea,
} from "@chakra-ui/react";
import { useDataEngine } from "@dhis2/app-runtime";
import { useNavigate, useSearch } from "@tanstack/react-location";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { DatePicker } from "antd";
import { GroupBase, Select } from "chakra-react-select";
import dayjs from "dayjs";
import { useStore } from "effector-react";
import { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { addIndicator, changeIndicatorGroup } from "../Events";
import {
  LocationGenerics,
  Option,
  ProjectField,
  QIProject,
} from "../interfaces";
import { dashboards, indicatorForGroup } from "../Store";
import { generateUid } from "../utils/uid";
import NewIndicator from "./NewIndicator";
export default function InstanceForm({
  programTrackedEntityAttributes,
  instance,
}: {
  programTrackedEntityAttributes: any[];
  instance: Partial<QIProject>;
}) {
  const navigate = useNavigate<LocationGenerics>();
  const search = useSearch<LocationGenerics>();
  const store = useStore(dashboards);
  const indicators = useStore(indicatorForGroup);
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [currentGroup, setCurrentGroup] = useState<string>(
    store.indicatorGroup
  );
  const engine = useDataEngine();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Partial<QIProject>>({ defaultValues: instance });

  const kHRn35W3Gq4 = watch("kHRn35W3Gq4");
  const TG1QzFgGTex = watch("TG1QzFgGTex");

  const onSubmit: SubmitHandler<Partial<QIProject>> = async (data) => {
    setSubmitting(() => true);
    const columns: string[] = [
      "y3hJLGjctPk",
      "iInAQ40vDGZ",
      "WQcY6nfPouv",
      "pIl8z4w8msL",
      "EvGGaaviqOn",
      "WEudJ6nxlzz",
      "TG1QzFgGTex",
      "kHRn35W3Gq4",
      "VWxBILfLC9s",
      "eCbusIaigyj",
      "rFSjQbZjJwF",
      "AETf2xvUmc8",
    ];
    let attributes = Object.entries(data).reduce(
      (a: any, [k, v]) =>
        columns.findIndex((c: string) => c === k) > -1 ? ((a[k] = v), a) : a,
      {}
    );

    const {
      instance,
      ou: orgUnit,
      te: trackedEntityType,
    }: { [k: string]: string } = Object.entries(data).reduce(
      (a: any, [k, v]) =>
        columns.findIndex((c: string) => c !== k) > -1 ? ((a[k] = v), a) : a,
      {}
    );

    attributes = Object.entries(attributes).map(([attribute, value]) => {
      return { attribute, value };
    });

    const trackedEntityInstance = {
      attributes,
      orgUnit,
      trackedEntityType,
      trackedEntityInstance: instance,
    };
    await mutateAsync(trackedEntityInstance);
    setSubmitting(() => false);
    navigate({
      to: "/data-entry",
      search: {
        ou: search.ou,
        program: search.program,
        trackedEntityType: search.trackedEntityType,
        page: 1,
        pageSize: 10,
        ouMode: "DESCENDANTS",
      },
      replace: true,
    });
  };

  const addEvent = async (data: any) => {
    const mutation: any = {
      type: "create",
      resource: "events",
      data,
    };
    return await engine.mutate(mutation);
  };

  const addTrackedEntityInstance = async (data: any) => {
    const mutation: any = {
      type: "create",
      resource: "trackedEntityInstances",
      data,
    };
    return await engine.mutate(mutation);
  };

  const { mutateAsync } = useMutation(addTrackedEntityInstance, {
    onSuccess: () => {
      queryClient.invalidateQueries([
        "trackedEntityInstances",
        1,
        store.ou,
        store.program,
        10,
      ]);
    },
  });

  const { mutateAsync: insertEvent } = useMutation(addEvent, {
    onSuccess: async (data, variables) => {
      await queryClient.invalidateQueries(["userUnits"]);
      const grp = variables.dataValues.find(
        (dv: any) => dv.dataElement === "kuVtv8R9n8q"
      );
      changeIndicatorGroup(grp.value);
    },
  });

  const [fields, setFields] = useState<ProjectField[]>(() =>
    programTrackedEntityAttributes.map((pTea: any) => {
      const {
        mandatory,
        trackedEntityAttribute: {
          optionSetValue,
          optionSet,
          generated,
          name,
          id,
        },
        valueType,
      } = pTea;

      let field: ProjectField = {
        id,
        name,
        mandatory,
        valueType,
        optionSetValue,
        options: optionSetValue
          ? optionSet.options.map((o: any) => [o.code, o.name])
          : null,
      };

      if (id === "kHRn35W3Gq4") {
        return { ...field, options: indicators, optionSetValue: true };
      }
      return field;
    })
  );

  const onInsert = async (values: any) => {
    const eventId = generateUid();
    const event = {
      event: eventId,
      program: "eQf9K4L2yxE",
      orgUnit: "akV6429SUqu",
      eventDate: new Date().toISOString(),
      dataValues: [
        {
          dataElement: "kToJ1rk0fwY",
          value: values.name,
        },
        {
          dataElement: "kuVtv8R9n8q",
          value: TG1QzFgGTex,
        },
      ],
    };
    await insertEvent(event);
    changeIndicatorGroup(TG1QzFgGTex);
    addIndicator([eventId, values.name]);
    setFields((prev) =>
      prev.map((p) => {
        if (p.id === "kHRn35W3Gq4") {
          return {
            ...p,
            options: [[eventId, values.name], ...indicators],
          };
        }
        return p;
      })
    );
    setValue("kHRn35W3Gq4", eventId);
  };

  const getField = (f: ProjectField) => {
    const Opts: any = {
      DATE: (
        <Controller
          control={control}
          name={f.id}
          render={({ field }) => (
            <DatePicker
              name={field.name}
              value={field.value ? dayjs(field.value) : null}
              onChange={(e) => {
                field.onChange(e);
              }}
            />
          )}
          rules={{
            required: { value: f.mandatory, message: `${f.name} is required` },
          }}
        />
      ),
      DATETIME: (
        <Controller
          control={control}
          name={f.id}
          render={({ field }) => (
            <DatePicker
              name={field.name}
              value={field.value ? dayjs(field.value) : null}
              onChange={(e) => {
                field.onChange(e);
              }}
            />
          )}
          rules={{
            required: { value: f.mandatory, message: `${f.name} is required` },
          }}
        />
      ),
      LONG_TEXT: (
        <Controller
          control={control}
          name={f.id}
          render={({ field }) => <Textarea {...field} />}
          rules={{
            required: { value: f.mandatory, message: `${f.name} is required` },
          }}
        />
      ),
    };
    if (f.optionSetValue) {
      return (
        <Controller
          control={control}
          name={f.id}
          render={({ field }) => {
            let currentVal: Option | undefined;
            const val: any = f.options?.find((pt) => pt[0] === field.value);
            if (val) {
              currentVal = { label: val[1], value: val[0] };
            }
            return (
              <Select<Option, false, GroupBase<Option>>
                value={currentVal}
                isClearable
                onChange={(e) => {
                  field.onChange(e?.value || "");
                  if (f.id === "TG1QzFgGTex") {
                    setValue("kHRn35W3Gq4", undefined);
                    changeIndicatorGroup(e?.value || "");
                    setCurrentGroup(() => e?.value || "");
                    const indicators = store.indicators
                      .filter(
                        (row: any) =>
                          row[store.indicatorGroupIndex] === e?.value
                      )
                      .map((row: any) => [row[0], row[store.indicatorIndex]]);
                    setFields((prev) =>
                      prev.map((p) => {
                        if (p.id === "kHRn35W3Gq4") {
                          return {
                            ...p,
                            options: [
                              ...indicators,
                              ["add", "Add new indicator"],
                            ],
                          };
                        }
                        return p;
                      })
                    );
                  }
                }}
                options={f.options?.map((o: string[]) => {
                  return {
                    label: o[1],
                    value: o[0],
                  };
                })}
                size="sm"
              />
            );
          }}
          rules={{
            required: { value: f.mandatory, message: `${f.name} is required` },
          }}
        />
      );
    }

    return (
      Opts[f.valueType] || (
        <Controller
          control={control}
          name={f.id}
          render={({ field }) => <Input {...field} />}
          rules={{
            required: { value: f.mandatory, message: `${f.name} is required` },
          }}
        />
      )
    );
  };

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {});
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (kHRn35W3Gq4 === "add") {
      setModalVisible(() => true);
    }
  }, [kHRn35W3Gq4]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <SimpleGrid spacing="30px" columns={3} mb="30px">
        {fields.map((field) => {
          return (
            <FormControl isInvalid={!!errors[field.id]} key={field.id}>
              <FormLabel htmlFor={field.id}>{field.name}</FormLabel>
              {getField(field)}
              <FormErrorMessage>{errors[field.id]?.message}</FormErrorMessage>
            </FormControl>
          );
        })}
      </SimpleGrid>
      <NewIndicator
        onInsert={onInsert}
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
      <Button type="submit">Save Project</Button>
    </form>
  );
}
